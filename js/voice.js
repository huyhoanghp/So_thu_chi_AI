// --- SPEECH RECOGNITION (VOICE TO TEXT AI ENTRY) ---

document.addEventListener('DOMContentLoaded', () => {
    const voiceRecordBtn = document.getElementById('voice-record-btn');
    const voicePulse = document.getElementById('voice-pulse');
    const aiInput = document.getElementById('ai-input');

    let recognition;
    let isRecording = false;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;

        recognition.onstart = () => {
            isRecording = true;
            if (voicePulse) voicePulse.classList.remove('hidden');
            voiceRecordBtn?.classList.add('bg-red-500', 'text-white');
            voiceRecordBtn?.classList.remove('bg-gray-100', 'dark:bg-slate-800');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (aiInput) aiInput.value = transcript;
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            window.showToast('Lỗi nhận dạng giọng nói: ' + event.error, 'error');
        };

        recognition.onend = () => {
            isRecording = false;
            if (voicePulse) voicePulse.classList.add('hidden');
            voiceRecordBtn?.classList.remove('bg-red-500', 'text-white');
            voiceRecordBtn?.classList.add('bg-gray-100', 'dark:bg-slate-800');
        };
    }

    voiceRecordBtn?.addEventListener('click', () => {
        if (!recognition) {
            window.showToast('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.', 'error');
            return;
        }
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
});
