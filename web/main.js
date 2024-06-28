import { streamGemini } from './gemini-api.js';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let fileInput = document.querySelector('input[name="file"]');
let output = document.querySelector('.output');
let downloadBtn = document.getElementById('downloadBtn');
let resultText = '';

function formatTextWithNewLines(text) {
  return text.replace(/(?<!\n)\n(?!\n)/g, '\n\n');
}

function jsonToSrt(jsonData) {
  let srtData = '';
  jsonData.forEach(item => {
    srtData += `${item.id}\n${item.timeline}\n${item.text}\n\n`;
  });
  return srtData;
}

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';
  resultText = ''; // Clear previous result

  try {
    let stream;
    if (fileInput.files.length > 0) {
      let file = fileInput.files[0];
      let formData = new FormData();
      formData.append('file', file);

      let response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      stream = streamResponseChunks(response);
    } else {
      let contents = [
        {
          role: 'user',
          parts: [
            { text: promptInput.value }
          ]
        }
      ];

      stream = streamGemini({
        model: 'gemini-1.0-pro',
        contents,
      });
    }

    let buffer = [];
    let md = new markdownit();
    for await (let chunk of stream) {
      buffer.push(chunk);

      
      let formattedText = formatTextWithNewLines(buffer.join(''));
      resultText = formattedText; // Update resultText with the formatted text
      output.innerHTML = md.render(formattedText);
    }

    // Hiển thị nút download sau khi có kết quả
    downloadBtn.style.display = 'block';
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

downloadBtn.onclick = () => {
  let srtText = jsonToSrt(JSON.parse(resultText));
  let blob = new Blob([srtText], { type: 'text/plain' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'result.srt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

async function* streamResponseChunks(response) {
  let buffer = '';

  const CHUNK_SEPARATOR = '\n\n';

  let processBuffer = async function* (streamDone = false) {
    while (true) {
      let flush = false;
      let chunkSeparatorIndex = buffer.indexOf(CHUNK_SEPARATOR);
      if (streamDone && chunkSeparatorIndex < 0) {
        flush = true;
        chunkSeparatorIndex = buffer.length;
      }
      if (chunkSeparatorIndex < 0) {
        break;
      }

      let chunk = buffer.substring(0, chunkSeparatorIndex);
      buffer = buffer.substring(chunkSeparatorIndex + CHUNK_SEPARATOR.length);
      chunk = chunk.replace(/^data:\s*/, '').trim();
      if (!chunk) {
        if (flush) break;
        continue;
      }
      let { error, text } = JSON.parse(chunk);
      if (error) {
        console.error(error);
        throw new Error(error?.message || JSON.stringify(error));
      }
      yield text;
      if (flush) break;
    }
  };

  const reader = response.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += new TextDecoder().decode(value);
      console.log(new TextDecoder().decode(value));
      yield* processBuffer();
    }
  } finally {
    reader.releaseLock();
  }

  yield* processBuffer(true);
}
