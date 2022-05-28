#import OpenCV
import cv2

# camera setup
capture = cv2.VideoCapture(0)

# QR scanner setup
detector = cv2.QRCodeDetector()

while True:

    # capture camera frame
    _, img = capture.read()

    # find boundary boxes and save data
    data, bbox, _ = detector.detectAndDecode(img)

    # if there are boundary boxes
    if (bbox is not None):
        # if there was data within bounding boxes print to terminal and write to file
        if data:
            print("qr code scanned: ", data)
            with open('most_recent_qr', mode='w') as f:
                f.write(data)

    # Press q to exit program
    if (cv2.waitKey(1) == ord("q")):
        break

# When the code is stopped the below closes all the applications/windows that the above has created
capture.release()
cv2.destroyAllWindows()