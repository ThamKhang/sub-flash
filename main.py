from flask import Flask, jsonify, request, send_file, send_from_directory
import os
import json
import google.generativeai as genai

API_KEY = 'TODO'
genai.configure(api_key=API_KEY)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def process_prompt(prompt):
    # Thêm yêu cầu dịch lên trên nội dung prompt
    request_text = ("Please translate the following subtitles from English to Vietnamese. "
                    "Maintain the original meaning and context as accurately as possible. "
                    "Ensure that the number of lines and structure remain the same as in the input, "
                    "and each line should be translated individually without merging. "
                    "Additionally, make sure the lines connect naturally as if spoken by one person, "
                    "ensuring a seamless flow in the conversation.\n\n")
    subtitles = []
    lines = prompt.strip().split('\n\n')
    for line in lines:
        parts = line.split('\n')
        if len(parts) >= 3:
            subtitle_id = parts[0].strip()
            timeline = parts[1].strip()
            subtitle_text = '\n'.join(parts[2:]).strip()
            subtitles.append({"id": subtitle_id, "timeline": timeline, "text": subtitle_text})

    return request_text + json.dumps(subtitles, ensure_ascii=False)

def process_result(result_text):
    # Ghi kết quả ra file
    return result_text

@app.route("/")
def index():
    return send_file('web/index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"})
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"})
    if file:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        with open(file_path, 'r') as f:
            content = f.read()

        # Chia các đoạn phụ đề thành từng đoạn riêng biệt
        subtitles = content.strip().split('\n\n')

        # Xử lý từng nhóm 20 đoạn phụ đề và gọi model
        processed_results = []
        for i in range(0, len(subtitles), 20):
            batch = subtitles[i:i+20]

            # Xử lý prompt cho từng batch
            processed_content = process_prompt('\n\n'.join(batch))

            model = genai.GenerativeModel(model_name="gemini-1.0-pro")
            response = model.generate_content(processed_content, stream=True)

            # Xử lý kết quả trả về
            processed_results.append(process_result(response))

        def stream():
            for result in processed_results:
                for chunk in result:
                    yield 'data: %s\n\n' % json.dumps({ "text": chunk.text })

        return stream(), {'Content-Type': 'text/event-stream'}

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('web', path)

if __name__ == "__main__":
    app.run(port=int(os.environ.get('PORT', 80)))
