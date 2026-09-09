import os
import re

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector


app = Flask(__name__)
CORS(app)
app.config["JSON_SORT_KEYS"] = False


# =========================================
# SLUG HELPER
# roadmap_topics has no slug column yet, so we
# derive a stable, URL-safe slug from the topic
# title (e.g. "JavaScript Fundamentals" ->
# "javascript-fundamentals"). This keeps every
# topic's "View Resources" link deterministic
# without touching the database schema.
# =========================================

def slugify(text):

    if not text:
        return ""

    slug = text.strip().lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)

    return slug.strip("-")

# =========================================
# DATABASE CONNECTION
# =========================================

def get_db_connection():
    connection = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT", 3306)),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE")
    )
    return connection


# =========================================
# HOME ROUTE
# =========================================

@app.route("/")
def home():

    return "CareerCompass Backend is Running!"


# =========================================
# GET ALL CAREERS
# =========================================

@app.route("/api/careers")
def get_careers():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)

        # Get all basic career information
        career_query = """
            SELECT
                id,
                slug,
                title,
                category,
                icon,
                color,
                image,
                short_description,
                salary_min,
                salary_max,
                demand,
                experience
            FROM careers
            ORDER BY id;
        """

        cursor.execute(career_query)

        careers = cursor.fetchall()


        # Get skills for all careers
        skills_query = """
            SELECT
                career_skills.career_id,
                skills.name
            FROM career_skills
            JOIN skills
            ON career_skills.skill_id = skills.id
            ORDER BY career_skills.career_id;
        """

        cursor.execute(skills_query)

        all_skills = cursor.fetchall()


        # Organize skills according to career_id
        skills_by_career = {}

        for skill in all_skills:

            career_id = skill["career_id"]

            if career_id not in skills_by_career:
                skills_by_career[career_id] = []

            skills_by_career[career_id].append({
                "name": skill["name"]
            })


        # Create clean API response
        formatted_careers = []

        for career in careers:

            formatted_career = {

                "id": career["id"],

                "slug": career["slug"],

                "title": career["title"],

                "category": career["category"],

                "icon": career["icon"],

                "color": career["color"],

                "image": career["image"],

                "shortDescription": career["short_description"],

                "salary": {
                    "min": float(career["salary_min"])
                    if career["salary_min"] is not None else None,

                    "max": float(career["salary_max"])
                    if career["salary_max"] is not None else None
                },

                "demand": career["demand"],

                "experience": career["experience"],

                "skills": skills_by_career.get(
                    career["id"],
                    []
                )
            }

            formatted_careers.append(formatted_career)


        return jsonify(formatted_careers)


    except mysql.connector.Error as error:

        return jsonify({
            "error": str(error)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()# =========================================
# GET COMPLETE CAREER DETAILS
# =========================================

@app.route("/api/careers/<int:career_id>")
def get_career(career_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(dictionary=True)


        # =====================================
        # 1. BASIC CAREER INFORMATION
        # =====================================

        cursor.execute("""
            SELECT
                id,
                slug,
                title,
                category,
                icon,
                color,
                image,
                featured,
                short_description,
                full_description,
                salary_min,
                salary_max,
                demand,
                difficulty,
                experience
            FROM careers
            WHERE id = %s;
        """, (career_id,))

        career = cursor.fetchone()


        # Career not found
        if not career:

            return jsonify({
                "error": "Career not found"
            }), 404


        # =====================================
        # CREATE FRONTEND-FRIENDLY RESPONSE
        # =====================================

        response = {

            "id": career["id"],

            "slug": career["slug"],

            "title": career["title"],

            "category": career["category"],

            "icon": career["icon"],

            "color": career["color"],

            "image": career["image"],

            "featured": bool(career["featured"]),


            "shortDescription": career["short_description"],

            "fullDescription": career["full_description"],


            "salary": {
                "min": float(career["salary_min"]) if career["salary_min"] else None,
                "max": float(career["salary_max"]) if career["salary_max"] else None
            },


            "demand": career["demand"],

            "experience": career["experience"]
        }


        # =====================================
        # 2. CAREER SNAPSHOT
        # =====================================

        cursor.execute("""
            SELECT
                work_mode,
                employment_type,
                education,
                job_openings,
                future_scope,
                industry
            FROM career_snapshot
            WHERE career_id = %s;
        """, (career_id,))

        snapshot = cursor.fetchone()


        if snapshot:

            response["snapshot"] = {

                "workMode": snapshot["work_mode"],

                "employmentType": snapshot["employment_type"],

                "education": snapshot["education"],

                "jobOpenings": snapshot["job_openings"],

                "futureScope": snapshot["future_scope"],

                "industry": snapshot["industry"]
            }

        else:

            response["snapshot"] = None


        # =====================================
        # 3. SKILLS
        # =====================================

        cursor.execute("""
            SELECT
                s.id,
                s.name,
                s.logo,
                s.url,
                cs.skill_category AS category
            FROM career_skills cs
            JOIN skills s
                ON cs.skill_id = s.id
            WHERE cs.career_id = %s
            ORDER BY s.name;
        """, (career_id,))

        response["skills"] = cursor.fetchall()


        # =====================================
        # 4. TOOLS
        # =====================================

        cursor.execute("""
            SELECT
                tool_name
            FROM career_tools
            WHERE career_id = %s
            ORDER BY id;
        """, (career_id,))

        tools = cursor.fetchall()

        response["tools"] = [
            tool["tool_name"]
            for tool in tools
        ]


        # =====================================
        # 5. RESPONSIBILITIES
        # =====================================

        cursor.execute("""
            SELECT
                responsibility
            FROM career_responsibilities
            WHERE career_id = %s
            ORDER BY id;
        """, (career_id,))

        responsibilities = cursor.fetchall()

        response["responsibilities"] = [
            item["responsibility"]
            for item in responsibilities
        ]


        # =====================================
        # 6. ROADMAP
        # =====================================

        cursor.execute("""
            SELECT
                step_number,
                title
            FROM roadmap_steps
            WHERE career_id = %s
            ORDER BY step_number;
        """, (career_id,))

        roadmap = cursor.fetchall()

        response["roadmap"] = [

            {
                "step": item["step_number"],
                "title": item["title"]
            }

            for item in roadmap
        ]


        # =====================================
        # 7. COMPANIES
        # =====================================

        cursor.execute("""
            SELECT
                c.name,
                c.logo,
                c.url
            FROM career_companies cc
            JOIN companies c
                ON cc.company_id = c.id
            WHERE cc.career_id = %s
            ORDER BY c.id;
        """, (career_id,))

        response["companies"] = cursor.fetchall()


        # =====================================
        # 8. QUICK INFO
        # =====================================

        cursor.execute("""
            SELECT
                label,
                value,
                icon
            FROM quick_info
            WHERE career_id = %s
            ORDER BY id;
        """, (career_id,))

        response["quickInfo"] = cursor.fetchall()


        # =====================================
        # 9. RESOURCES
        # =====================================

        cursor.execute("""
            SELECT
                r.name,
                r.type,
                r.logo,
                r.url
            FROM career_resources cr
            JOIN resources r
                ON cr.resource_id = r.id
            WHERE cr.career_id = %s
            ORDER BY r.id;
        """, (career_id,))

        response["resources"] = cursor.fetchall()


        # =====================================
        # 10. CERTIFICATIONS
        # =====================================

        cursor.execute("""
            SELECT
                certification
            FROM career_certifications
            WHERE career_id = %s
            ORDER BY id;
        """, (career_id,))

        certifications = cursor.fetchall()

        response["certifications"] = [

            item["certification"]

            for item in certifications
        ]


        # =====================================
        # 11. RELATED CAREERS
        # =====================================

        cursor.execute("""
            SELECT
                c.id,
                c.title,
                c.slug,
                c.icon,
                c.short_description
            FROM related_careers rc
            JOIN careers c
                ON rc.related_career_id = c.id
            WHERE rc.career_id = %s
            ORDER BY c.id;
        """, (career_id,))

        related = cursor.fetchall()


        response["relatedCareers"] = [

            {
                "id": item["id"],
                "name": item["title"],
                "slug": item["slug"],
                "icon": item["icon"],
                "shortDescription": item["short_description"]
            }

            for item in related
        ]


        # =====================================
        # 12. PROJECTS TO BUILD
        # career_projects -> projects
        # ordered by project_order
        # =====================================

        cursor.execute("""
            SELECT
                p.id,
                p.title,
                p.description,
                p.difficulty,
                p.project_type,
                p.image,
                p.url
            FROM career_projects cp
            JOIN projects p
                ON cp.project_id = p.id
            WHERE cp.career_id = %s
            ORDER BY cp.project_order;
        """, (career_id,))

        projects = cursor.fetchall()


        response["projects"] = [

            {
                "id": item["id"],
                "title": item["title"],
                "shortDescription": item["description"],
                "difficulty": item["difficulty"],
                "type": item["project_type"],
                "image": item["image"],
                "url": item["url"]
            }

            for item in projects
        ]


        # =====================================
        # 13. FAQs
        # =====================================

        cursor.execute("""
            SELECT
                question,
                answer
            FROM career_faqs
            WHERE career_id = %s
            ORDER BY id;
        """, (career_id,))

        response["faqs"] = cursor.fetchall()


        # =====================================
        # RETURN CLEAN RESPONSE
        # =====================================

        return jsonify(response)


    except mysql.connector.Error as error:

        return jsonify({
            "error": str(error)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# =========================================
# GET COMPLETE CAREER ROADMAP
# (steps → topics → subtopics)
# =========================================

@app.route("/api/careers/<int:career_id>/roadmap")
def get_career_roadmap(career_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # =====================================
        # 1. BASIC CAREER INFO
        # =====================================

        cursor.execute("""
            SELECT
                id,
                title,
                category,
                difficulty
            FROM careers
            WHERE id = %s;
        """, (career_id,))

        career = cursor.fetchone()

        if not career:
            return jsonify({
                "error": "Career not found"
            }), 404

        response = {
            "career": {
                "id": career["id"],
                "title": career["title"],
                "category": career["category"],
                "difficulty": career["difficulty"]
            },
            "phases": []
        }

        # =====================================
        # 2. GET ROADMAP STEPS
        # =====================================

        cursor.execute("""
            SELECT
                id,
                step_number,
                title
            FROM roadmap_steps
            WHERE career_id = %s
            ORDER BY step_number;
        """, (career_id,))

        phases = cursor.fetchall()

        if not phases:
            return jsonify(response)

        phase_ids = [phase["id"] for phase in phases]

        # =====================================
        # 3. GET TOPICS FOR ALL STEPS
        #
        # Correct structure:
        # roadmap_step_topics → topics
        # =====================================

        placeholders = ",".join(["%s"] * len(phase_ids))

        cursor.execute(f"""
            SELECT
                rst.roadmap_step_id,
                rst.topic_order,
                t.id AS topic_id,
                t.title AS topic_title,
                t.slug AS topic_slug
            FROM roadmap_step_topics rst
            JOIN topics t
                ON rst.topic_id = t.id
            WHERE rst.roadmap_step_id IN ({placeholders})
            ORDER BY
                rst.roadmap_step_id,
                rst.topic_order;
        """, tuple(phase_ids))

        step_topics = cursor.fetchall()

        topic_ids = list({
            row["topic_id"]
            for row in step_topics
        })

        # =====================================
        # 4. GET SUBTOPICS FOR ALL TOPICS
        #
        # Correct structure:
        # topic_subtopics.topic_id → topics.id
        # =====================================

        subtopics_by_topic = {}

        if topic_ids:

            placeholders = ",".join(["%s"] * len(topic_ids))

            cursor.execute(f"""
                SELECT
                    id,
                    topic_id,
                    title,
                    subtopic_order
                FROM topic_subtopics
                WHERE topic_id IN ({placeholders})
                ORDER BY
                    topic_id,
                    subtopic_order;
            """, tuple(topic_ids))

            subtopics = cursor.fetchall()

            for sub in subtopics:

                subtopics_by_topic.setdefault(
                    sub["topic_id"],
                    []
                ).append({
                    "id": sub["id"],
                    "title": sub["title"]
                })

        # =====================================
        # 5. GROUP TOPICS UNDER EACH STEP
        # =====================================

        topics_by_phase = {}

        for topic in step_topics:

            topics_by_phase.setdefault(
                topic["roadmap_step_id"],
                []
            ).append({

                "id": topic["topic_id"],

                "title": topic["topic_title"],

                "slug": topic["topic_slug"],

                "subtopics": subtopics_by_topic.get(
                    topic["topic_id"],
                    []
                )
            })

        # =====================================
        # 6. BUILD FINAL ROADMAP RESPONSE
        # =====================================

        for phase in phases:

            response["phases"].append({

                "id": phase["id"],

                "stepNumber": phase["step_number"],

                "title": phase["title"],

                "topics": topics_by_phase.get(
                    phase["id"],
                    []
                )
            })

        return jsonify(response)

    except mysql.connector.Error as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# =========================================
# GET COMPLETE CAREER RESOURCES (steps → topics → resources)
# Uses the topics / roadmap_step_topics / topic_resources
# schema (separate from the roadmap_topics/subtopics tables
# used by the roadmap checklist endpoint above).
# =========================================

@app.route("/api/careers/<int:career_id>/resources")
def get_career_resources(career_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # 1. Basic career info
        cursor.execute("""
            SELECT id, title, category, difficulty
            FROM careers
            WHERE id = %s;
        """, (career_id,))

        career = cursor.fetchone()

        if not career:
            return jsonify({"error": "Career not found"}), 404

        response = {
            "career": {
                "id": career["id"],
                "title": career["title"],
                "category": career["category"],
                "difficulty": career["difficulty"]
            },
            "steps": []
        }

        # 2. Roadmap steps for this career
        cursor.execute("""
            SELECT id, step_number, title
            FROM roadmap_steps
            WHERE career_id = %s
            ORDER BY step_number;
        """, (career_id,))

        steps = cursor.fetchall()

        if not steps:
            return jsonify(response)

        step_ids = [step["id"] for step in steps]

        # 3. Topics attached to these steps in ONE query (avoids N+1)
        placeholders = ",".join(["%s"] * len(step_ids))

        cursor.execute(f"""
            SELECT
                rst.roadmap_step_id,
                rst.topic_order,
                t.id AS topic_id,
                t.title AS topic_title,
                t.slug AS topic_slug
            FROM roadmap_step_topics rst
            JOIN topics t ON rst.topic_id = t.id
            WHERE rst.roadmap_step_id IN ({placeholders})
            ORDER BY rst.roadmap_step_id, rst.topic_order;
        """, tuple(step_ids))

        step_topics = cursor.fetchall()
        topic_ids = list({row["topic_id"] for row in step_topics})

        # 4. Resources for these topics in ONE query, grouped by
        # resource_category, ordered by resource_order (avoids N+1)
        resources_by_topic = {}

        if topic_ids:

            placeholders = ",".join(["%s"] * len(topic_ids))

            cursor.execute(f"""
                SELECT
                    tr.topic_id,
                    tr.resource_category,
                    tr.resource_order,
                    r.id AS resource_id,
                    r.name,
                    r.type,
                    r.logo,
                    r.url
                FROM topic_resources tr
                JOIN resources r ON tr.resource_id = r.id
                WHERE tr.topic_id IN ({placeholders})
                ORDER BY tr.topic_id, tr.resource_category, tr.resource_order;
            """, tuple(topic_ids))

            for row in cursor.fetchall():

                topic_bucket = resources_by_topic.setdefault(row["topic_id"], {})
                category_bucket = topic_bucket.setdefault(row["resource_category"], [])

                category_bucket.append({
                    "id": row["resource_id"],
                    "name": row["name"],
                    "type": row["type"],
                    "logo": row["logo"],
                    "url": row["url"]
                })

        # 5. Group topics (with their resources) under their step
        topics_by_step = {}

        for row in step_topics:
            topics_by_step.setdefault(row["roadmap_step_id"], []).append({
                "id": row["topic_id"],
                "title": row["topic_title"],
                "slug": row["topic_slug"],
                "resources": resources_by_topic.get(row["topic_id"], {})
            })

        # 6. Assemble final response
        for step in steps:
            response["steps"].append({
                "id": step["id"],
                "stepNumber": step["step_number"],
                "title": step["title"],
                "topics": topics_by_step.get(step["id"], [])
            })

        return jsonify(response)

    except mysql.connector.Error as error:

        return jsonify({"error": str(error)}), 500

    finally:

        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# =========================================
# GET ROADMAP STEP RESOURCES
# Resources are organized for the complete roadmap step.
# =========================================

@app.route("/api/roadmap-steps/<int:step_id>/resources")
def get_roadmap_step_resources(step_id):

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # 1. Get roadmap step and career information
        cursor.execute("""
            SELECT
                rs.id,
                rs.step_number,
                rs.title,
                c.id AS career_id,
                c.title AS career_title,
                c.slug AS career_slug
            FROM roadmap_steps rs
            JOIN careers c ON rs.career_id = c.id
            WHERE rs.id = %s;
        """, (step_id,))

        step = cursor.fetchone()

        if not step:
            return jsonify({"error": "Roadmap step not found"}), 404

        response = {
            "step": {
                "id": step["id"],
                "stepNumber": step["step_number"],
                "title": step["title"]
            },
            "career": {
                "id": step["career_id"],
                "title": step["career_title"],
                "slug": step["career_slug"]
            },
            "videos": [],
            "notes": [],
            "documentation": []
        }

        # 2. Get all resources attached directly to this roadmap step
        cursor.execute("""
            SELECT
                r.id,
                r.name,
                r.type,
                r.logo,
                r.url,
                rsr.resource_category,
                rsr.resource_order
            FROM roadmap_step_resources rsr
            JOIN resources r ON rsr.resource_id = r.id
            WHERE rsr.roadmap_step_id = %s
            ORDER BY rsr.resource_category, rsr.resource_order;
        """, (step_id,))

        resources = cursor.fetchall()

        # 3. Group resources by category
        for resource in resources:
            formatted_resource = {
                "id": resource["id"],
                "name": resource["name"],
                "type": resource["type"],
                "logo": resource["logo"],
                "url": resource["url"]
            }

            category = resource["resource_category"]

            if category == "video":
                response["videos"].append(formatted_resource)
            elif category == "notes":
                response["notes"].append(formatted_resource)
            elif category == "documentation":
                response["documentation"].append(formatted_resource)

        return jsonify(response)

    except mysql.connector.Error as error:
        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# =========================================
# RUN FLASK APPLICATION
# =========================================

if __name__ == "__main__":
    app.run(debug=True)