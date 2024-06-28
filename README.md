# English to Vietnamese Subtitle Translation using Gemini API

## Description

This application uses Flask to build a web service that allows users to upload English subtitle files, split them into smaller segments, and utilize Google's Generative AI model (Gemini) to translate them into Vietnamese. The application ensures high academic quality translations and employs a loop to ensure all subtitles are fully translated without being skipped by the model.

## Key Features

- **File Upload**: Users can upload English subtitle files for translation.
- **Subtitle Splitting**: The application splits the subtitles into smaller segments for efficient processing.
- **AI Model Usage**: Utilizes Google's Generative AI model to translate subtitles from English to Vietnamese.
- **Academic Quality Assurance**: Ensures translations have high academic quality, surpassing typical automatic translation services.
- **Processing Loop**: Uses a loop to ensure all subtitles are fully translated without being skipped.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ThamKhang/sub-flash.git
   cd sub-flash
   ```

2. **Install the required libraries**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure the API key**:
   - Open the source file and replace `API_KEY` with your API key from Google Generative AI.

## Usage

1. **Start the application**:
   ```bash
   python main.py
   ```

2. **Access the application**:
   - Open a web browser and go to `http://localhost:<port>`, where `<port>` is the port you specified (default is 80).

## Technical Details

- **Libraries**:
  - `Flask`: To build the web application.
  - `google.generativeai`: To use Google's AI translation API.
  - Other libraries such as `os` and `json` for file and data handling.

- **Code Structure**:
  - `process_prompt(prompt)`: Processes subtitle content, adds translation request, and reformats it into JSON.
  - `process_result(result_text)`: Writes the translation result to a file.
  - `upload_file()`: Handles file upload requests, splits the subtitles, and calls the translation model.
  - Other routes serve static files and the main interface.

## Notes

- Ensure you have an active internet connection to use Google's API.
- Your API key must have access to the Google Generative AI service.

## Contact

For any questions or suggestions, please contact via email: thamkhang2003@gmail.com.
