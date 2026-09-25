from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

auth = Blueprint("auth", __name__)


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT")),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE")
    )


# =========================
# REGISTER
# =========================

@auth.route("/api/auth/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id FROM users WHERE email = %s",
        (email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        conn.close()

        return jsonify({
            "success": False,
            "message": "Email is already registered."
        }), 409

    password_hash = generate_password_hash(password)

    cursor.execute(
        """
        INSERT INTO users (name, email, password_hash)
        VALUES (%s, %s, %s)
        """,
        (name, email, password_hash)
    )

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Registration successful."
    }), 201


# =========================
# LOGIN
# =========================

@auth.route("/api/auth/login", methods=["POST"])
@auth.route("/api/auth/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, name, email, password_hash
        FROM users
        WHERE email = %s
        """,
        (email,)
    )

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    if not check_password_hash(user["password_hash"], password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    # =========================================
    # CREATE LOGIN SESSION
    # =========================================

    session.permanent = True

    session["user_id"] = user["id"]
    session["user_name"] = user["name"]
    session["user_email"] = user["email"]

    # =========================================
    # SUCCESS RESPONSE
    # =========================================

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }), 200

    data = request.get_json()

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, name, email, password_hash
        FROM users
        WHERE email = %s
        """,
        (email,)
    )

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    if not check_password_hash(user["password_hash"], password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401


# =========================
# GET SELECTED CAREER
# =========================

@auth.route("/api/auth/career", methods=["GET"])
def get_selected_career():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            c.id,
            c.title,
            c.slug,
            c.icon,
            c.image,
            c.short_description,
            c.difficulty,
            c.demand
        FROM users u
        LEFT JOIN careers c
            ON u.selected_career_id = c.id
        WHERE u.id = %s
    """, (user_id,))

    career = cursor.fetchone()

    cursor.close()
    conn.close()

    if not career or career["id"] is None:
        return jsonify({
            "success": True,
            "career": None
        }), 200

    return jsonify({
        "success": True,
        "career": career
    }), 200


# =========================
# SELECT CAREER
# =========================

@auth.route("/api/auth/career", methods=["POST"])
def select_career():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    data = request.get_json() or {}

    career_id = data.get("career_id")


    # =====================================================
    # DESELECT CAREER
    # =====================================================

    if career_id is None:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE users
            SET selected_career_id = NULL
            WHERE id = %s
        """, (user_id,))

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "selected": False,
            "message": "Career deselected successfully."
        }), 200


    # =====================================================
    # CHECK CAREER EXISTS
    # =====================================================

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id FROM careers WHERE id = %s",
        (career_id,)
    )

    career = cursor.fetchone()


    if not career:

        cursor.close()
        conn.close()

        return jsonify({
            "success": False,
            "message": "Career not found."
        }), 404


    # =====================================================
    # SELECT CAREER
    # =====================================================

    cursor.execute("""
        UPDATE users
        SET selected_career_id = %s
        WHERE id = %s
    """, (career_id, user_id))

    conn.commit()

    cursor.close()
    conn.close()


    return jsonify({
        "success": True,
        "selected": True,
        "message": "Career selected successfully."
    }), 200

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    data = request.get_json()
    career_id = data.get("career_id")

    if not career_id:
        return jsonify({
            "success": False,
            "message": "Career ID is required."
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id FROM careers WHERE id = %s",
        (career_id,)
    )

    career = cursor.fetchone()

    if not career:
        cursor.close()
        conn.close()

        return jsonify({
            "success": False,
            "message": "Career not found."
        }), 404

    cursor.execute("""
        UPDATE users
        SET selected_career_id = %s
        WHERE id = %s
    """, (career_id, user_id))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Career selected successfully."
    }), 200


        # =========================================
    # CREATE LOGIN SESSION
    # =========================================

    # session["user_id"] = user["id"]
    # session["user_name"] = user["name"]
    # session["user_email"] = user["email"]

    # return jsonify({
    #     "success": True,
    #     "message": "Login successful.",
    #     "user": {
    #         "id": user["id"],
    #         "name": user["name"],
    #         "email": user["email"]
    #     }
    # }), 200


# =========================
# CHECK CURRENT USER
# =========================

@auth.route("/api/auth/me", methods=["GET"])
def get_current_user():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    return jsonify({
        "success": True,
        "user": {
            "id": user_id,
            "name": session.get("user_name"),
            "email": session.get("user_email")
        }
    }), 200


# =========================
# LOGOUT
# =========================

@auth.route("/api/auth/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logout successful."
    }), 200


# =========================================================
# ROADMAP PROGRESS - GET
# =========================================================

@auth.route("/api/auth/progress", methods=["GET"])
def get_roadmap_progress():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    career_id = request.args.get("career_id")

    if not career_id:
        return jsonify({
            "success": False,
            "message": "Career ID is required."
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            subtopic_id,
            completed
        FROM roadmap_progress
        WHERE user_id = %s
          AND career_id = %s
    """, (user_id, career_id))

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    progress = {}

    for row in rows:
        progress[str(row["subtopic_id"])] = bool(row["completed"])

    return jsonify({
        "success": True,
        "progress": progress
    }), 200


# =========================================================
# ROADMAP PROGRESS - SAVE
# =========================================================

@auth.route("/api/auth/progress", methods=["POST"])
def save_roadmap_progress():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    data = request.get_json() or {}

    career_id = data.get("career_id")
    subtopic_id = data.get("subtopic_id")
    completed = data.get("completed")

    if career_id is None or subtopic_id is None or completed is None:
        return jsonify({
            "success": False,
            "message": "Career ID, subtopic ID and completed status are required."
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO roadmap_progress
            (user_id, career_id, subtopic_id, completed)
        VALUES
            (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            completed = VALUES(completed)
    """, (
        user_id,
        career_id,
        str(subtopic_id),
        bool(completed)
    ))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Progress saved successfully."
    }), 200