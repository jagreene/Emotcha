//Start Parallax Animation
$('.parallax').parallax();

//Declare JQuery Selectors
var $submitBtn = $(".submit-btn");
var $nextBtn = $(".next-btn");
var $downEmotchaBtn = $("#down-emotcha");
var $loginBtn = $(".login-btn");
var $exampleImg = $("#example-img");

//Initialize Video Variable
var video = document.querySelector('video');
var capturing = false;
var finished = false;
var firstFinish = true;
var updateInterval;

//Initialize Canvas Elements
var canvas = document.createElement('canvas');
var faceCanvas = document.createElement('canvas');

var ctx = canvas.getContext('2d');
var ctxf = faceCanvas.getContext('2d');

canvas.width = 450;
canvas.height = 450;

//Initialize Emotional Varialbes
var exampleEmotions;
var liveEmotions;
var metric;

//Get Initial Example
getExample();

//On Click Functions
$submitBtn.click(function(){
    //Logic for play pause restart button on live card
    if(finished){
        getExample();
        $submitBtn.children().replaceWith("<i class='mdi-av-pause'></i>");
        $submitBtn.toggleClass('red', true);
        $submitBtn.toggleClass('green', false);
        $loginBtn.toggleClass('disabled', true);
        $('.how-to').toggleClass('hide', false);
        finished = false
    } else if(capturing){
        getSnapshot();
    } else {
        captureVideo();
    }
})

$nextBtn.click(function() {
    //Logic for new example button on example card
    getExample();
})

$downEmotchaBtn.click(function() {
    //second movement button
    $.smoothScroll({scrollElemnt: $('.emotcha-container'), scrollTarget: '#emotcha-target', offset: -75, speed: 1000, afterScroll: function(){
        setTimeout(captureVideo, 200);
        capturing = true;
    }});
})

$loginBtn.click(function(){
    //Sets alerts for login buttons
    if(!$loginBtn.hasClass('disabled')){
        alert('You could now sucessfully login if this was a real site!');
    } else {
        alert('You need to match emotional profiles with the picture on the left');
    }
});

function getExample() {
    //fetch picture and emotional profile from server
    $.get('/image')
    .done(function (data, status){
        exampleEmotions = data.emotions;
        $exampleImg.attr('src', 'images/'+data.file);
        $('#ex-angry').css('width', (data.emotions.Angry*100)+'%');
        $('#ex-sad').css('width', (data.emotions.Sad*100)+'%');
        $('#ex-neutral').css('width', (data.emotions.Neutral*100)+'%');
        $('#ex-surprise').css('width', (data.emotions.Surprise*100)+'%');
        $('#ex-fear').css('width', (data.emotions.Fear*100)+'%');
        $('#ex-happy').css('width', (data.emotions.Happy*100)+'%');
    })
    .error(function (data, status){
        console.log(status);
    })
}

function getSnapshot(){
    //Grab image from video and put it on canvas, pause video
    capturing = false;
    ctx.drawImage(video, 0, 0, 600, 450);
    $(video).replaceWith(canvas);
    clearInterval(updateInterval);
    $('.submit-btn').children().replaceWith("<i class='mdi-av-play-arrow'></i>");
    $(video).faceDetection({
        complete: function (faces){
            if(faces[0]){
                faceCanvas.width = faces[0].width;
                faceCanvas.height = faces[0].height;
                ctxf.drawImage(canvas, faces[0].x, faces[0].y, faces[0].width, faces[0].height, 0, 0, faceCanvas.width, faceCanvas.height);
                var dataURI = faceCanvas.toDataURL('image/jpg');
                postImage(dataURI);
            } else {
                var dataURI = canvas.toDataURL('image/jpg');
                postImage(dataURI);
            }
        },

        error: function (code, message){
            console.log("Face Error!", message);
            var dataURI = canvas.toDataURL('image/jpg');
            postImage(dataURI);
        }
    });
}

function update(){
    //Grab image from video, find face, and send to server every second
    ctx.drawImage(video, 0, 0, 600, 450);
    $(canvas).faceDetection({
        complete: function (faces){
            if(faces[0]){
                faceCanvas.width = faces[0].width;
                faceCanvas.height = faces[0].height;
                ctxf.drawImage(canvas, faces[0].x, faces[0].y, faces[0].width, faces[0].height, 0, 0, faceCanvas.width, faceCanvas.height);
                var dataURI = faceCanvas.toDataURL('image/jpg');
                postImage(dataURI);
            }
        },

        error: function (code, message){
            console.log("Face Error!", message);
        }
    });
}

function postImage(dataURI){
    //send face to server and respond by changing bars
    $.post("/image", {data: dataURI})
    .done(function (data, status) {
        liveEmotions = data;
        $('#lv-angry').css('width', (data.Angry*100)+'%');
        $('#lv-sad').css('width', (data.Sad*100)+'%');
        $('#lv-neutral').css('width', (data.Neutral*100)+'%');
        $('#lv-surprise').css('width', (data.Surprise*100)+'%');
        $('#lv-fear').css('width', (data.Fear*100)+'%');
        $('#lv-happy').css('width', (data.Happy*100)+'%');

        //Measure if emotions close enough to unlock system
        diffs =[Math.abs(liveEmotions.Angry - exampleEmotions.Angry),
                Math.abs(liveEmotions.Sad - exampleEmotions.Sad),
                Math.abs(liveEmotions.Neutral - exampleEmotions.Neutral),
                Math.abs(liveEmotions.Surprise - exampleEmotions.Surprise),
                Math.abs(liveEmotions.Fear - exampleEmotions.Fear),
                Math.abs(liveEmotions.Happy - exampleEmotions.Happy)]

        console.log("Diffs:", diffs);
        sum = 0;
        for(i=0; i<diffs.length; i++){
            sum+= diffs[i];
        }

        metric = 2 - sum;

        console.log("Metric:", metric);
        if(metric>1.25){
            $submitBtn.children('i').replaceWith("<i class='mdi-content-undo'></i>");
            $submitBtn.toggleClass('red', false);
            $submitBtn.toggleClass('green', true);
            $loginBtn.toggleClass('disabled', false);
            $('.how-to').toggleClass('hide', true);
            capturing = false;
            finished = true;
            if(firstFinish){
                alert("You've sucessfuly matched emotional profiles and unlocked the login button, tap the green arrow on your portrait to try again or the login button to complete the demo login");
                firstFinish = false;
            }
        }
    })
    .error(function (data, status){
        console.log(status);
    });
}

function captureVideo() {
    //Start webcam video playing
    if(!capturing){
        $('canvas').replaceWith(video)
    };

    navigator.getUserMedia  = navigator.getUserMedia ||navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;


    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true}, function(stream) {
                video.src = window.URL.createObjectURL(stream);
        }, function (err){
            console.log("ERROR!", err);
        });
    }
    $('.submit-btn').children().replaceWith("<i class='mdi-av-pause'></i>");
    capturing = true;
    updateInterval = setInterval(update, 1000);
}
