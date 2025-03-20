import torch
import torch.nn as nn
from torchvision.models import resnet50
import torchvision.transforms as transforms

# Define class names in order of remapped labels
class_names = (
    ["airplane", "automobile", "bird", "cat", "deer", "dog", "frog", "horse", "ship", "truck"] +
    ["apple", "aquarium_fish", "baby", "bear", "beaver", "bed", "bee", "beetle", "bicycle", "bottle",
     "bowl", "boy", "bridge", "bus", "butterfly", "camel", "can", "castle", "caterpillar", "cattle",
     "chair", "chimpanzee", "clock", "cloud", "cockroach", "couch", "crab", "crocodile", "cup",
     "dinosaur", "dolphin", "elephant", "flatfish", "forest", "fox", "girl", "hamster", "house",
     "kangaroo", "keyboard", "lamp", "lawn_mower", "leopard", "lion", "lizard", "lobster", "man",
     "maple_tree", "motorcycle", "mountain", "mouse", "mushroom", "oak_tree", "orange", "orchid",
     "otter", "palm_tree", "pear", "pickup_truck", "pine_tree", "plain", "plate", "poppy", "porcupine",
     "possum", "rabbit", "raccoon", "ray", "road", "rocket", "rose", "sea", "seal", "shark", "shrew",
     "skunk", "skyscraper", "snail", "snake", "spider", "squirrel", "streetcar", "sunflower", "sweet_pepper",
     "table", "tank", "telephone", "television", "tiger", "tractor", "train", "trout", "tulip", "turtle",
     "wardrobe", "whale", "willow_tree", "wolf", "woman", "worm"] +
    ["digit_0", "digit_1", "digit_2", "digit_3", "digit_4", "digit_5", "digit_6", "digit_7", "digit_8", "digit_9"] +
    ["t-shirt", "trouser", "pullover", "dress", "coat", "sandal", "shirt", "sneaker", "bag", "ankle_boot"]
)

# Load the trained model
model = resnet50(pretrained=False)  # Load architecture without pretrained weights
model.fc = nn.Linear(model.fc.in_features, 130)  # Match your trained model

#Set device to GPU if available, otherwise CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

#Load the model, mapping i to the appropriate device
model.load_state_dict(torch.load("trained_model.pth",map_location=device))

#Move the model to the device
model = model.to(device)
model.eval()

# Preprocessing for inference
preprocess = transforms.Compose([
    transforms.Resize((32, 32)),  # Match training size
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

# Warm-up to catch loading issues
try:
    dummy_input = torch.randn(1, 3, 224, 224).to(device)
    model(dummy_input)
    print("Model warm-up successful")
except Exception as e:
    print("Model warm-up failed:", str(e))

def predict_image(img):
    # Preprocess the image
    img_tensor = preprocess(img).unsqueeze(0).to(device)  # Add batch dimension and move to device
    with torch.no_grad():
        outputs = model(img_tensor)  # Get logits
        probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]  # Convert to probabilities
        top5_prob, top5_idx = probabilities.topk(5)  # Get top 5
    # Map to class names and probabilities
    results = [(class_names[idx.item()], prob.item()) for prob, idx in zip(top5_prob, top5_idx)]
    return results