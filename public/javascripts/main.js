var $submitBtn = $(".submit-btn");
var $exampleImg = $("#example-img");

var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
var capturing = true;

getExample();
captureVideo();

$submitBtn.click(function(){
    if(capturing){
        getSnapshot();
    } else {
        captureVideo();
    }
})

function getExample() {
    $.get('/image')
    .done(function (data, status){
        $exampleImg.attr('src', data.image);
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
    canvas.width = 450;
    canvas.height = 450;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 600, 450);
    $(video).replaceWith(canvas);
    var dataURI = canvas.toDataURL('image/jpg');
    console.log("URI",dataURI);
    console.log("Canvas Width", canvas.width);
    console.log("Canvas Height", canvas.height);
    console.log("Video width:", video.videoWidth);
    console.log("Video height:", video.videoHeight);

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
        $(canvas).replaceWith("<video width='600', height='450', autoplay></video>")
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
    var capturing = true;
    console.log("Video width:", video.videoWidth);
    console.log("Video height:", video.videoHeight);
}
