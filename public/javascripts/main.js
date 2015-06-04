var $submitBtn = $(".submit-btn");
var $nextBtn = $(".next-btn");
var $exampleImg = $("#example-img");

var video = document.querySelector('video');
var capturing = true;
var updateInterval;

var canvas = document.createElement('canvas');
var faceCanvas = document.createElement('canvas');

var ctx = canvas.getContext('2d');
var ctxf = faceCanvas.getContext('2d');

canvas.width = 450;
canvas.height = 450;

var exampleEmotions;
var liveEmotions;
var metric;

getExample();
captureVideo();

$submitBtn.click(function(){
    $('.submit-btn').toggleClass('red', true);
    $('.submit-btn').toggleClass('green', false);
    if(capturing){
        getSnapshot();
    } else {
        captureVideo();
    }
})

$nextBtn.click(function() {
    getExample();
})

function getExample() {
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
    capturing = false;
    ctx.drawImage(video, 0, 0, 600, 450);
    $(video).replaceWith(canvas);
    clearInterval(updateInterval);
    $('.submit-btn').children().replaceWith("<i class='mdi-av-play-arrow'></i>");
    $(video).faceDetection({
        complete: function (faces){
            console.log(faces);
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
    ctx.drawImage(video, 0, 0, 600, 450);
    $(canvas).faceDetection({
        complete: function (faces){
            console.log(faces);
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
    $.post("/image", {data: dataURI})
    .done(function (data, status) {
        liveEmotions = data;
        $('#lv-angry').css('width', (data.Angry*100)+'%');
        $('#lv-sad').css('width', (data.Sad*100)+'%');
        $('#lv-neutral').css('width', (data.Neutral*100)+'%');
        $('#lv-surprise').css('width', (data.Surprise*100)+'%');
        $('#lv-fear').css('width', (data.Fear*100)+'%');
        $('#lv-happy').css('width', (data.Happy*100)+'%');

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

        metric = 1 - sum;

        console.log("Metric:", metric);
        if(metric>.65){
            $('.submit-btn').children().replaceWith("<i class='mdi-navigation-check'></i>");
            $('.submit-btn').toggleClass('red', false);
            $('.submit-btn').toggleClass('green', true);
        }
    })
    .error(function (data, status){
        console.log(status);
    });
}

function captureVideo() {
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
