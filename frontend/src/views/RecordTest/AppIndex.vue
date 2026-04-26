<template>
  <div class="Container">
    <div class="Header">
      <h1>Record Test Application (With ASR)</h1>
      <p>点击开始录音，点击结束停止 进行语音识别。</p>
    </div>
  </div>
  <div class="Buttons">
    <button @click="startRecording" :disabled="isRecording">开始</button>
    <button @click="stopRecording" :disabled="!isRecording">结束</button>
  </div>
  <div v-if="errorMessage" class="message error-message">
    错误: {{ errorMessage }}
  </div>
  <div v-if="uploadMessage" class="message upload-message">
    上传状态: {{ uploadMessage }}
  </div>
  <div v-if="partialResult" class="message partial-result">
    实时识别结果: {{ partialResult }}
  </div>
  <div v-if="finalResult" class="message final-result">
    最终识别结果: {{ finalResult }}
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from "axios";

const isRecording = ref(false);
const mediaRecorder = ref(null);
const audioChunks = ref([]);
const errorMessage = ref('');
const uploadMessage = ref('');
const partialResult = ref(''); // 实时
const finalResult = ref('');   // 最终
const currentSessionId = ref(null); // ASR会话ID
const intervalId = ref(null); // 定时器ID

const getSupportedMimeType = () => {
  const preferredMimeType = 'audio/webm;codecs=opus';
  const fallbackMimeType = 'audio/webm';

  if (MediaRecorder.isTypeSupported(preferredMimeType)) {
    return preferredMimeType;
  }
  if (MediaRecorder.isTypeSupported(fallbackMimeType)) {
    return fallbackMimeType;
  }
  if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
    return 'audio/ogg;codecs=opus';
  }
  return 'audio/webm';
};

const startRecording = async () => {
  errorMessage.value = '';
  uploadMessage.value = '';
  partialResult.value = '';
  finalResult.value = '';
  audioChunks.value = [];
  currentSessionId.value = null;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      errorMessage.value = '您的浏览器不支持任何可用的录音格式。';
      return;
    }
    console.log('使用 MIME 类型进行录音:', mimeType);

    mediaRecorder.value = new MediaRecorder(stream, { mimeType: mimeType });

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data);
      }
    };

    mediaRecorder.value.onstop = () => {
      if (audioChunks.value.length > 0) {
        sendAudioToServer(new Blob(audioChunks.value, { type: mediaRecorder.value.mimeType }), true);
      } else {
        stopASRSession();
      }
      clearInterval(intervalId.value);
      isRecording.value = false;
      console.log('Recording stopped');
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.value.start(1000);
    isRecording.value = true;
    console.log('Recording started');

    intervalId.value = setInterval(() => {
      if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
        if (audioChunks.value.length > 0) {
          const blobToSend = new Blob(audioChunks.value, { type: mediaRecorder.value.mimeType });
          audioChunks.value = [];
          sendAudioToServer(blobToSend);
        }
      }
    }, 1000);

  } catch (error) {
    console.error('启动录音时出错:', error);
    errorMessage.value = '无法启动录音: ' + error.message;
    isRecording.value = false;
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
  }
};

const sendAudioToServer = async (audioBlob, isFinalChunk = false) => {
  if (audioBlob.size === 0) {
    console.log("No audio data to send.");
    if (isFinalChunk) {
      stopASRSession();
    }
    return;
  }

  uploadMessage.value = '正在发送音频...';
  // 根据实际的mimeType确定文件名后缀
  const fileExtension = audioBlob.type.split('/')[1] || 'webm';
  const filename = `recording_${Date.now()}.${fileExtension}`;

  const formData = new FormData();
  formData.append('audioFile', audioBlob, filename);
  if (currentSessionId.value) {
    formData.append('session_id', currentSessionId.value); // 附加会话ID
  }

  try {
    // 假设后端接口接受分块数据
    const response = await axios.post('/api/receiveRecordingDataTest', formData);

    const responseData = response.data;
    uploadMessage.value = '音频发送成功!';
    console.log('成功:', responseData);

    if (responseData.session_id && !currentSessionId.value) {
      currentSessionId.value = responseData.session_id; // 保存会话ID
    }

    if (responseData.partial_results && responseData.partial_results.length > 0) {

      partialResult.value = responseData.partial_results.join(' ');
    }

    if (isFinalChunk) {
      stopASRSession();
    }

  } catch (error) {
    clearInterval(intervalId.value);
    isRecording.value = false;
    currentSessionId.value = null;

    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data || error.response.statusText;
      uploadMessage.value = `上传失败: ${error.response.status} - ${JSON.stringify(errorData)}`;
      console.error('失败:', error.response.status, errorData);
      errorMessage.value = `后端错误: ${JSON.stringify(errorData)}`;
    } else {
      uploadMessage.value = '网络错误: ' + error.message;
      console.error('网络错误:', error);
      errorMessage.value = '网络错误: ' + error.message;
    }
  }
};

const stopASRSession = async () => {
  if (!currentSessionId.value) {
    console.warn("没有活动的ASR会话可以停止。");
    return;
  }

  uploadMessage.value = '正在停止语音识别...';
  try {
    const response = await axios.post('/api/stopASR', { session_id: currentSessionId.value });
    const responseData = response.data;

    uploadMessage.value = '语音识别已停止。';
    console.log('停止ASR成功:', responseData);

    if (responseData.results && responseData.results.final_result) {
      finalResult.value = responseData.results.final_result.join(' '); // Final result
      console.log('最终识别结果:', finalResult.value);
    }
    partialResult.value = '';

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data || error.response.statusText;
      uploadMessage.value = `停止ASR失败: ${error.response.status} - ${JSON.stringify(errorData)}`;
      console.error('停止ASR失败:', error.response.status, errorData);
      errorMessage.value = `停止ASR后端错误: ${JSON.stringify(errorData)}`;
    } else {
      uploadMessage.value = '停止ASR网络错误: ' + error.message;
      console.error('停止ASR网络错误:', error);
      errorMessage.value = '停止ASR网络错误: ' + error.message;
    }
  } finally {
    currentSessionId.value = null; // 无论成功失败，都清除会话ID
  }
};
</script>

<style scoped>
.Container {
  text-align: center;
  margin-top: 50px;
}
.Header h1 {
  color: #333;
}
.Header p {
  color: #666;
}
.Buttons {
  margin-top: 20px;
  text-align: center;
}
button {
  margin-right: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:nth-of-type(2) {
  background-color: #f44336;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
  font-size: 1em;
  text-align: center;
}
.error-message {
  background-color: #ffe0e0;
  color: #d32f2f;
  border: 1px solid #d32f2f;
}
.upload-message {
  background-color: #e0f2f7;
  color: #0277bd;
  border: 1px solid #0277bd;
}
.partial-result {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #2e7d32;
  word-wrap: break-word;
}
.final-result {
  background-color: #fffde7;
  color: #fbc02d;
  border: 1px solid #fbc02d;
  font-weight: bold;
  word-wrap: break-word;
}
</style>
