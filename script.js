document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('audio-upload');
    const apiKeyInput = document.getElementById('api-key');
    const dropZone = document.getElementById('drop-zone');
    const fileNameDisplay = document.getElementById('file-name-display');
    const transcribeBtn = document.getElementById('transcribe-btn');
    const btnSpinner = document.getElementById('btn-spinner');
    const uploadForm = document.getElementById('upload-form');
    
    const loadingState = document.getElementById('loading-state');
    const transcriptSection = document.getElementById('transcript-section');
    const transcriptContainer = document.getElementById('transcript-container');
    const rawTranscriptText = document.getElementById('raw-transcript-text');
    const rawTranscriptContainer = document.getElementById('raw-transcript-container');
    const overallSummaryText = document.getElementById('overall-summary-text');
    const overallSummaryContainer = document.getElementById('overall-summary-container');
    const errorMsg = document.getElementById('error-message');

    // New element references for Action Items & Exports
    const actionItemsContainer = document.getElementById('action-items-container');
    const actionItemsList = document.getElementById('action-items-list');
    const exportTxtBtn = document.getElementById('export-txt-btn');
    const exportMdBtn = document.getElementById('export-md-btn');
    const transcriptExportableArea = document.getElementById('transcript-exportable-area');

    let currentTranscriptData = null;

    // Handle File Selection
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag & Drop Handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files; // Update input files
        handleFiles(files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            fileNameDisplay.textContent = files[0].name;
            transcribeBtn.disabled = false;
        } else {
            fileNameDisplay.textContent = "";
            transcribeBtn.disabled = true;
        }
    }

    // Handle form submit
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (fileInput.files.length === 0) return;
        
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('openrouter_key', apiKeyInput.value);

        // UI Reset
        errorMsg.classList.add('hidden');
        transcriptSection.classList.add('hidden');
        transcribeBtn.disabled = true;
        btnSpinner.classList.remove('hidden');
        loadingState.classList.remove('hidden');
        dropZone.style.opacity = '0.5';

        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'ஆடியோவைச் செயலாக்க முடியவில்லை.');
            }

            renderTranscript(data);

        } catch (err) {
            console.error(err);
            errorMsg.textContent = err.message || "எதிர்பாராத பிழை ஏற்பட்டது.";
            errorMsg.classList.remove('hidden');
        } finally {
            // Restore UI
            loadingState.classList.add('hidden');
            btnSpinner.classList.add('hidden');
            transcribeBtn.disabled = false;
            dropZone.style.opacity = '1';
        }
    });

    function renderTranscript(data) {
        currentTranscriptData = data;
        transcriptContainer.innerHTML = '';
        
        if (data.raw_transcript) {
            rawTranscriptText.textContent = data.raw_transcript;
            rawTranscriptContainer.classList.remove('hidden');
        } else {
            rawTranscriptContainer.classList.add('hidden');
        }

        if (data.overall_summary) {
            overallSummaryText.textContent = data.overall_summary;
            overallSummaryContainer.classList.remove('hidden');
        } else {
            overallSummaryContainer.classList.add('hidden');
        }

        // Handle Action Items
        actionItemsList.innerHTML = '';
        if (data.action_items && data.action_items.length > 0) {
            data.action_items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                actionItemsList.appendChild(li);
            });
            actionItemsContainer.classList.remove('hidden');
        } else {
            actionItemsContainer.classList.add('hidden');
        }

        const utterances = data.speaker_points;
        if (!utterances || utterances.length === 0) {
            transcriptContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted);">இந்த ஆடியோ ஃபைலில் எந்த பேச்சும் கண்டறியப்படவில்லை.</p>';
            transcriptSection.classList.remove('hidden');
            return;
        }

        // Map speaker aliases (e.g. "A", "B") to CSS classes (speaker-A, speaker-B)
        // If speakers are just "1", "2", we map them to A, B, etc.
        const speakerMap = new Map();
        const availableClasses = ['speaker-A', 'speaker-B', 'speaker-C', 'speaker-D'];

        utterances.forEach((utt, index) => {
            if (!speakerMap.has(utt.speaker)) {
                const classIdx = speakerMap.size % availableClasses.length;
                speakerMap.set(utt.speaker, availableClasses[classIdx]);
            }

            const card = document.createElement('div');
            card.className = `utterance-card ${speakerMap.get(utt.speaker)}`;
            card.style.animationDelay = `${index * 0.1}s`;

            const label = document.createElement('span');
            label.className = 'speaker-label';
            
            // Clean up any "Speaker" prefixes returned by the AI so we don't display "Speaker Speaker A"
            let rawSpk = utt.speaker.toString().replace(/speaker\s*/i, '').trim(); 
            label.textContent = `பேச்சாளர் ${rawSpk}`;

            const text = document.createElement('p');
            text.className = 'utterance-text';
            text.textContent = utt.text;

            card.appendChild(label);
            card.appendChild(text);
            transcriptContainer.appendChild(card);
        });

        transcriptSection.classList.remove('hidden');
        
        // Smooth scroll to results
        setTimeout(() => {
            transcriptSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    // Export Functionality
    exportTxtBtn.addEventListener('click', () => {
        if (!currentTranscriptData) return;
        let txt = "கூட்டத்தின் உரைமாற்ற சுருக்கம்\n\n";
        if (currentTranscriptData.raw_transcript) {
            txt += "மூல உரை:\n" + currentTranscriptData.raw_transcript + "\n\n";
        }

        if (currentTranscriptData.overall_summary) {
            txt += "ஒட்டுமொத்த சுருக்கம்:\n" + currentTranscriptData.overall_summary + "\n\n";
        }
        
        if (currentTranscriptData.action_items && currentTranscriptData.action_items.length > 0) {
            txt += "செயல் உருப்படிகள்:\n";
            currentTranscriptData.action_items.forEach(item => {
                txt += "- " + item + "\n";
            });
            txt += "\n";
        }

        if (currentTranscriptData.speaker_points && currentTranscriptData.speaker_points.length > 0) {
            txt += "பேச்சாளர் முறிவு:\n";
            currentTranscriptData.speaker_points.forEach(utt => {
                txt += "பேச்சாளர் " + utt.speaker + ":\n" + utt.text + "\n\n";
            });
        }

        downloadFile(txt, 'transcript_summary.txt', 'text/plain');
    });

    exportMdBtn.addEventListener('click', () => {
        if (!currentTranscriptData) return;
        let md = "# கூட்டத்தின் உரைமாற்ற சுருக்கம்\n\n";
        if (currentTranscriptData.raw_transcript) {
            md += "## மூல உரை\n\n" + currentTranscriptData.raw_transcript + "\n\n";
        }

        if (currentTranscriptData.overall_summary) {
            md += "## ஒட்டுமொத்த சுருக்கம்\n" + currentTranscriptData.overall_summary + "\n\n";
        }
        
        if (currentTranscriptData.action_items && currentTranscriptData.action_items.length > 0) {
            md += "## செயல் உருப்படிகள்\n";
            currentTranscriptData.action_items.forEach(item => {
                md += "- [ ] " + item + "\n";
            });
            md += "\n";
        }

        if (currentTranscriptData.speaker_points && currentTranscriptData.speaker_points.length > 0) {
            md += "## பேச்சாளர் முறிவு\n";
            currentTranscriptData.speaker_points.forEach(utt => {
                md += "**பேச்சாளர் " + utt.speaker + ":**\n" + utt.text + "\n\n";
            });
        }

        downloadFile(md, 'transcript_summary.md', 'text/markdown');
    });

    function downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }
});
