import logging
import os
import re
import subprocess

from flask import Blueprint, request, send_from_directory
from .base import SERVER_HOST

audio_bp = Blueprint('audio', __name__)

voiceMap = {
    "xiaoxiao": "zh-CN-XiaoxiaoNeural",
    "xiaoyi": "zh-CN-XiaoyiNeural",
    "yunjian": "zh-CN-YunjianNeural",
    "yunxi": "zh-CN-YunxiNeural",
    "yunxia": "zh-CN-YunxiaNeural",
    "yunyang": "zh-CN-YunyangNeural",
    "xiaobei": "zh-CN-liaoning-XiaobeiNeural",
    "xiaoni": "zh-CN-shaanxi-XiaoniNeural",
    "hiugaai": "zh-HK-HiuGaaiNeural",
    "hiumaan": "zh-HK-HiuMaanNeural",
    "wanlung": "zh-HK-WanLungNeural",
    "hsiaochen": "zh-TW-HsiaoChenNeural",
    "hsioayu": "zh-TW-HsiaoYuNeural",
    "yunjhe": "zh-TW-YunJheNeural",
}


def getVoiceById(voiceId):
    return voiceMap.get(voiceId)


def remove_html(string):
    return re.sub(r'<[^>]+>', '', string)


def createAudio(text, file_name, voiceId):
    new_text = remove_html(text)
    voice = getVoiceById(voiceId)
    if not voice:
        return "error params"

    file_path = os.path.join(os.getcwd(), "tts", file_name)
    relative_path = f"/tts/{file_name}"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    try:
        subprocess.run(
            ['edge-tts', '--voice', voice, '--text', new_text, '--write-media', file_path],
            check=True
        )
        return f'{SERVER_HOST}{relative_path}'
    except subprocess.CalledProcessError as e:
        logging.error(f"创建音频失败: {e}")
        return "创建音频失败"
    except Exception as e:
        logging.error(f"处理音频时发生其他错误: {e}")
        return "处理音频时发生错误"


def getParameter(request, paramName):
    return request.args.get(paramName, "")


@audio_bp.route('/dealAudio', methods=['POST', 'GET'])
def dealAudio():
    return createAudio(
        getParameter(request, 'text'),
        getParameter(request, 'file_name'),
        getParameter(request, 'voice')
    )


@audio_bp.route('/static/<path:filename>')
def serve_static(filename):
    from flask import current_app
    return send_from_directory(current_app.static_folder, filename)


@audio_bp.route('/tts/<path:filename>')
def serve_tts(filename):
    return send_from_directory(os.path.join(os.getcwd(), 'tts'), filename)
