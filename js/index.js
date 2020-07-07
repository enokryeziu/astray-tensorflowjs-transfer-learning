const classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');
let net;

async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();
  var classArray = ["class-b", "class-c", "class-d"];

  const addExample = classId => {
    const activation = net.infer(webcamElement, 'conv_preds');
    //console.log(draw());
    classifier.addExample(activation, classId);
    if(classId !=3)
      document.getElementById(classArray[classId]).disabled = false;
    else {
      document.getElementById("playButton").disabled = false;
    }
  };

function draw() {

    var hidden_canvas = document.querySelector('canvas'),
      context = hidden_canvas.getContext('2d');
      var width = webcamElement.videoWidth,
      height = webcamElement.videoHeight;

    if (width && height) {
      hidden_canvas.width = width;
      hidden_canvas.height = height;
      
      context.drawImage(webcamElement, 0, 0, width, height);

      return hidden_canvas.toDataURL('image/png');
    }
  }
  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));
  document.getElementById('class-d').addEventListener('click', () => addExample(3));
  document.getElementById('playButton').addEventListener('click', () => startTheGame());
  async function startTheGame() {
    document.getElementById("help").outerHTML = "";
    while (true) {
      if (classifier.getNumClasses() > 0) {
     
        const activation = net.infer(webcamElement, 'conv_preds');
        const result = await classifier.predictClass(activation);

        const classes = ['Up', 'Left', 'Down', 'Right'];
        document.getElementById('console').innerText = `
          Prediction: ${classes[result.classIndex]}\n
          Probability: ${(result.confidences[result.classIndex] * 100).toFixed(2)}%
        `;
        
          var axis = [0, 0];

          //up
          if(classes[result.classIndex] == 'Up') {
              if(axis[1] === 0) {
                  axis[1] = 1;
              }else  {
              axis[1] = 0;
              }
          }   
          //down
          if(classes[result.classIndex] == 'Down') {
              if(axis[1] === 0) {
                  axis[1] = -1;
              } else  {
                  axis[1] = 0;
              }
          }   

          //left
          if(classes[result.classIndex] == 'Left') {
              if(axis[0] === 0) {
                  axis[0] = -1;
              } else  {
                  axis[0] = 0;
              }
          }  

          //right
          if(classes[result.classIndex] == 'Right') {
              if(axis[0] === 0) {
                  axis[0] = 1;
              } else  {
                  axis[0] = 0;
              }
          }  

          var timer = setInterval(function(){
              //run the callback
              onMoveKey(axis);

          }, 1);
      }

      await tf.nextFrame();
    }
  }
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
      navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
      navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({ video: true },
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata', () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

app();
