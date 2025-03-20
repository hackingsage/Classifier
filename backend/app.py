from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from model import predict_image

app = Flask(__name__) 
CORS(app) #For React frontend

@app.route('/predict',methods=['POST'])
def predict():
    print('Received prediction request')
    try:
        file = request.files['image'] #Get the uploaded image from request
        img = Image.open(file.stream).convert("RGB") #Open and convert image to RGB
        results = predict_image(img)
        print('Prediction results:', results)
        return jsonify({
            "top_prediction": {"label": results[0][0], "probability": f"{results[0][1]*100:.1f}%"},
            "others": [{"label": r[0], "probability": f"{r[1]*100:.1f}%"} for r in results[1:]]
        })  # Return JSON response
    except Exception as e:
        print('Error during prediction:', str(e))
        return jsonify({"error": str(e)}), 500   #Error Handeling
    
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000) #Run server