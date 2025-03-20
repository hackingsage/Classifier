# 🖼️ Classifier

## 📂 **Project Structure**
```plaintext
image_predictor/
├── backend/                # Flask backend
│   ├── app.py             # Flask server
|   |── model_training     # Training the model
│   ├── model.py           # Using pretrained model to predict result
│   └── requirements.txt   # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── DrawingBoard.js # Drawing canvas component
│   │   ├── UploadImage.js # Upload component
│   │   ├── App.css       # Styling
│   │   └── index.js      # Entry point
│   ├── package.json       # Frontend dependencies
│   └── public/            # Static assets (e.g., index.html)
└── README.md              # Project info
```

Steps to run:- 

Backend
```
cd backend
pip3 install -r requirements.txt
python3 app.py
```

Frontend
```
cd frontend
npm install
npm start
```

Note:- Run both simultaneously
