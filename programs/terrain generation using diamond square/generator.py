import sys
from PyQt5.QtWidgets import *
from PyQt5 import uic
from PyQt5.QtGui import *
from PyQt5.QtWidgets import QApplication, QWidget, QPushButton, QFrame, QColorDialog
from PyQt5.QtGui import QColor
import cv2
import numpy as np
import qimage2ndarray
from visuals import *
import time

form_class = uic.loadUiType("program.ui")[0]

def diamond_square(matrix, size, seed, roughness, x, y, step):
    half = step // 2
    if half < 1:
        return

    # Diamond step
    a = matrix[x][y]
    b = matrix[x + step][y]
    c = matrix[x][y + step]
    d = matrix[x + step][y + step]

    average = (a + b + c + d) / 4.0
    matrix[x + half][y + half] = average + np.random.uniform(-1, 1) * roughness

    def get_value(x, y):
        if x < 0 or x >= size or y < 0 or y >= size:
            return 0
        else:
            return matrix[x][y]

    # Square step
    matrix[x + half][y] = (a + b + get_value(x+half, y-half) + get_value(x+half, y+half)) / 4.0
    matrix[x][y + half] = (a + c + get_value(x-half, y+half) + get_value(x+half, y+half)) / 4.0
    matrix[x + step][y + half] = (b + d + get_value(x+half, y+half) + get_value(x+step+half, y+half)) / 4.0
    matrix[x + half][y + step] = (c + d + get_value(x+half, y+half) + get_value(x+half, y+step+half)) / 4.0

    # Recurse into the four quadrants
    diamond_square(matrix, size, seed, roughness, x, y, half)
    diamond_square(matrix, size, seed, roughness, x + half, y, half)
    diamond_square(matrix, size, seed, roughness, x, y + half, half)
    diamond_square(matrix, size, seed, roughness, x + half, y + half, half)

def generate_terrain(n, roughness, seed):
    if not (n-1 > 0 and ((n-1) & (n-2) == 0)):
        raise ValueError("n-1 should be a power of 2")

    # Initialize the grid
    matrix = np.zeros((n, n))
    matrix[0][0] = seed
    matrix[0][n - 1] = seed
    matrix[n - 1][0] = seed
    matrix[n - 1][n - 1] = seed

    step = n - 1

    diamond_square(matrix, n, seed, roughness, 0, 0, step)
    matrix[0][0] = (matrix[0][1] + matrix[1][0]) // 2
    matrix[0][n-1] = (matrix[0][n-2] + matrix[1][n-1]) // 2
    matrix[n-1][0] = (matrix[n-2][0] + matrix[n-1][1]) // 2
    matrix[n-1][n-1] = (matrix[n-2][n-1] + matrix[n-1][n-2]) // 2
    return matrix

class WindowClass(QMainWindow, form_class):
    def __init__(self) :
        super().__init__()
        self.setupUi(self)
        self.visualPixmap = QPixmap()
        self.visualLabel.setPixmap(self.visualPixmap)
        self.generateButton.clicked.connect(self.generate_terrain)
        self.generateButton.setAutoRepeat(True)
        self.segmentSlider.setRange(1,9)
        self.segmentSlider.setSingleStep(1)
        self.segmentSlider.valueChanged.connect(self.dispSegmentValue)
        self.roughnessSlider.setRange(1,20)
        self.roughnessSlider.setSingleStep(1)
        self.roughnessSlider.valueChanged.connect(self.dispRoughValue)
        self.denoiseSlider.setRange(0,50)
        self.denoiseSlider.setSingleStep(1)
        self.denoiseSlider.valueChanged.connect(self.dispDenoiseValue)
        self.denoiseStrength = self.denoiseSlider.value()

        self.visual = np.zeros((512, 512))
        qImg = qimage2ndarray.array2qimage(self.visual).rgbSwapped()
        self.visualLabel.setPixmap(QPixmap(qImg))
        self.colorSchemeBox.currentIndexChanged.connect(self.setColorScheme)

        self.saveImgButton.clicked.connect(self.save_Image)

    def dispSegmentValue(self):
        n = self.segmentSlider.value()
        self.segmentLabel.setText(str(2**n + 1))

    def dispRoughValue(self):
        r = self.roughnessSlider.value()
        self.roughnessLabel.setText(str(r))

    def dispDenoiseValue(self):
        d = self.denoiseSlider.value()
        self.denoiseLabel.setText(str(d))
        self.denoiseStrength = d

    def generate_terrain(self):
        # Usage

        try:
            n = 2**(self.segmentSlider.value()) + 1  # Change this to your desired grid size (power of 2)
            roughness = self.roughnessSlider.value()  # Adjust this for terrain roughness
            seed = 0  # Adjust this for the initial seed value

            X = np.arange(n)
            Y = np.arange(n)

            terrain = generate_terrain(n, roughness / 3, seed).astype(np.int32)
            terrain = terrain[1:n, 1:n]
            #smooth filtering
            smooth_filter = np.array([[1, 2, 1], [2, 4, 2], [1, 2, 1]])
            #terrain = cv2.filter2D(terrain, -1, smooth_filter)

            #normalize (min ~ max -> 0 ~ 255)
            min_height = terrain.min()
            max_height = terrain.max()
            terrain = (terrain - min_height) * 255 // (max_height - min_height)
            terrain = cv2.fastNlMeansDenoising(terrain.astype(np.uint8), None,
            self.denoiseStrength, 3, 25)

            #visualize
            width, height = 512, 512
            self.visual = np.zeros((width, height), dtype=np.int32)

            square_size = width // (n-1)

            for i in range(n-1):
                for j in range(n-1):
                    self.visual[square_size*i: square_size*(i+1),
                    square_size*j: square_size*(j+1)] = terrain[i][j]

            self.setColorScheme()

        except Exception as e:
            print(e)

    def setColorScheme(self):
        try:
            curr_scheme = self.colorSchemeBox.currentText()

            if curr_scheme == "grayscale":
                qImg = qimage2ndarray.array2qimage(self.visual).rgbSwapped()
                self.visualLabel.setPixmap(QPixmap(qImg))
            elif curr_scheme == "normal":
                self.c_visual = convert_gray_to_rgb_matrix(self.visual)
                self.c_visual = setColorScheme(self.c_visual).astype(np.uint8)
                qImg = qimage2ndarray.array2qimage(self.c_visual)
                self.visualLabel.setPixmap(QPixmap(qImg))
        except Exception as e:
            print(e)

    def save_Image(self):
        file_name, file_extension = "1", ".png"
        curr_scheme = self.colorSchemeBox.currentText()
        if curr_scheme == "grayscale":
            cv2.imwrite(file_name + file_extension, self.visual)
        else:
            cv2.imwrite(file_name + file_extension, self.c_visual)
