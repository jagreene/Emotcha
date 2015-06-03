var $submitBtn = $(".submit-btn");
var $nextBtn = $(".next-btn");
var $exampleImg = $("#example-img");

var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
var capturing = true;

getExample();
captureVideo();

$submitBtn.click(function(){
    console.log("Capturing:", capturing);
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
        console.log(data.file);
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
    canvas = document.createElement('canvas');
    faceCanvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 450;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 600, 450);
    $(video).replaceWith(canvas);
    $('.submit-btn').children().replaceWith("<i class='mdi-content-undo'></i>");
    $(video).faceDetection({
        complete: function (faces){
            console.log(faces);
            if(faces[0]){
                faceCanvas.width = faces[0].width;
                faceCanvas.height = faces[0].height;
                var ctxf = faceCanvas.getContext('2d');
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

function postImage(dataURI){
    $.post("/image", {data: dataURI})
    .done(function (data, status) {
        $('#lv-angry').css('width', (data.Angry*100)+'%');
        $('#lv-sad').css('width', (data.Sad*100)+'%');
        $('#lv-neutral').css('width', (data.Neutral*100)+'%');
        $('#lv-surprise').css('width', (data.Surprise*100)+'%');
        $('#lv-fear').css('width', (data.Fear*100)+'%');
        $('#lv-happy').css('width', (data.Happy*100)+'%');
    })
    .error(function (data, status){
        console.log(status);
    });
}

function captureVideo() {
    if(!capturing){
        $('canvas').replaceWith("<video width='600', height='450', autoplay></video>")
        video = document.querySelector('video');
    };

    navigator.getUserMedia  = navigator.getUserMedia ||navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;


    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true}, function(stream) {
                video.src = window.URL.createObjectURL(stream);
        }, function (err){
            console.log("ERROR!", err);
        });
    }
    $('.submit-btn').children().replaceWith("<i class='mdi-image-camera-alt'></i>");
    capturing = true;
}
