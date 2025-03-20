import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.transforms as transforms
import torchvision.datasets as datasets
from torch.utils.data import DataLoader, ConcatDataset
from torchvision.models import resnet50
from tqdm import tqdm

def main():
    #Transformations
    transform = transforms.Compose([
        transforms.Resize((32, 32)),  #Resize images to 32x32
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))  #Normalize to [-1,1]
    ])
    mnist_transform = transforms.Compose([
        transforms.Resize((32, 32)),
        transforms.Grayscale(num_output_channels=3),  #Convert to 3 channels
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])

    # Load datasets
    cifar10_train = datasets.CIFAR10(root='./data', train=True, download=True, transform=transform)
    cifar10_test = datasets.CIFAR10(root='./data', train=False, download=True, transform=transform)
    cifar100_train = datasets.CIFAR100(root='./data', train=True, download=True, transform=transform)
    cifar100_test = datasets.CIFAR100(root='./data', train=False, download=True, transform=transform)
    mnist_train = datasets.MNIST(root='./data', train=True, download=True, transform=mnist_transform)
    mnist_test = datasets.MNIST(root='./data', train=False, download=True, transform=mnist_transform)
    fashion_mnist_train = datasets.FashionMNIST(root='./data', train=True, download=True, transform=mnist_transform)
    fashion_mnist_test = datasets.FashionMNIST(root='./data', train=False, download=True, transform=mnist_transform)

    # Remap labels
    cifar100_train.targets = [label + 10 for label in cifar100_train.targets]
    cifar100_test.targets = [label + 10 for label in cifar100_test.targets]
    mnist_train.targets = [label + 110 for label in mnist_train.targets]
    mnist_test.targets = [label + 110 for label in mnist_test.targets]
    fashion_mnist_train.targets = [label + 120 for label in fashion_mnist_train.targets]
    fashion_mnist_test.targets = [label + 120 for label in fashion_mnist_test.targets]

    # Combine datasets
    combined_train = ConcatDataset([cifar10_train, cifar100_train, mnist_train, fashion_mnist_train])
    combined_test = ConcatDataset([cifar10_test, cifar100_test, mnist_test, fashion_mnist_test])

    # Data loaders
    batch_size = 128
    train_loader = DataLoader(combined_train, batch_size=batch_size, shuffle=True, num_workers=2)
    test_loader = DataLoader(combined_test, batch_size=batch_size, shuffle=False, num_workers=2)

    # Model setup
    num_classes = 130  # 10 + 100 + 10 + 10
    model = resnet50(pretrained=True)
    model.fc = nn.Linear(model.fc.in_features, num_classes)    #final fully connected layer to output the total number of classes
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu") #Checks for GPU else goes for CPU
    model = model.to(device)

    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # Training function
    def train(model, train_loader, criterion, optimizer, device):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        for inputs, labels in tqdm(train_loader, desc="Training"):
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
        train_loss = running_loss / len(train_loader)
        train_acc = 100.0 * correct / total
        return train_loss, train_acc

    # Evaluation function
    def evaluate(model, test_loader, criterion, device):
        model.eval()
        running_loss = 0.0
        correct = 0
        total = 0
        with torch.no_grad():
            for inputs, labels in tqdm(test_loader, desc="Testing"):
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                running_loss += loss.item()
                _, predicted = outputs.max(1)
                total += labels.size(0)
                correct += predicted.eq(labels).sum().item()
        test_loss = running_loss / len(test_loader)
        test_acc = 100.0 * correct / total
        return test_loss, test_acc

    # Training loop
    num_epochs = 50 # Due to GPU restrictions, else we can go upto 100
    for epoch in range(num_epochs):
        print(f"Epoch [{epoch+1}/{num_epochs}]")
        train_loss, train_acc = train(model, train_loader, criterion, optimizer, device)
        print(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        test_loss, test_acc = evaluate(model, test_loader, criterion, device)
        print(f"Test Loss: {test_loss:.4f}, Test Acc: {test_acc:.2f}%")
    # Save the trained model
    torch.save(model.state_dict(), 'trained_model.pth')
    print("Model saved as 'trained_model.pth'")

if __name__ == "__main__":
    main()