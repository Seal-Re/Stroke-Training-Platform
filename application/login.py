import hashlib
import uuid
import bcrypt
from flask import Blueprint, request, jsonify, make_response
from .utils import users_collection

login_bp = Blueprint('login', __name__)


def _check_password(plain: str, stored_hash: str) -> bool:
    """Verify password against stored hash.

    Supports both bcrypt hashes (new) and legacy unsalted MD5 hashes.
    Returns (match, needs_rehash).
    """
    if stored_hash.startswith("$2b$") or stored_hash.startswith("$2a$"):
        return bcrypt.checkpw(plain.encode("utf-8"), stored_hash.encode("utf-8"))
    # Legacy MD5 path
    md5_hash = hashlib.md5(plain.encode("utf-8")).hexdigest()
    return md5_hash == stored_hash


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


@login_bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return make_response(jsonify({"success": False, "error": "用户名和密码均为必填项"}), 400)

        user = users_collection.find_one({"username": username})

        if not user or not _check_password(password, user["password"]):
            return make_response(jsonify({"success": False, "error": "用户名或密码错误"}), 401)

        # Transparently migrate legacy MD5 hash to bcrypt on successful login
        stored = user["password"]
        if not (stored.startswith("$2b$") or stored.startswith("$2a$")):
            users_collection.update_one(
                {"username": username},
                {"$set": {"password": _hash_password(password)}}
            )

        token = str(uuid.uuid4())
        return make_response(jsonify({
            "success": True,
            "token": token,
            "userInfo": {
                "username": user["username"],
                "class": user.get("class", 0)
            }
        }), 200)

    except Exception as err:
        return make_response(jsonify({"success": False, "error": str(err)}), 500)
