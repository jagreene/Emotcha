var $submitBtn = $(".submit-btn");

var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
var capturing = true;

captureVideo();

$submitBtn.click(function(){
    if(capturing){
        getSnapshot();
    } else {
        captureVideo();
    }
})

function getSnapshot(){
    capturing = false;
    canvas = document.createElement('canvas');
    canvas.width = video.width;
    canvas.height = video.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    var dataURI = canvas.toDataURL('image/jpeg');
    $(video).replaceWith(canvas);

    $.post("/image", dataURI)
    .done(function (data, status) {
        console.log(data);
    })
    .error(function (data, status){
        console.log(status);
    });
}

function captureVideo() {
    if(!capturing){
        $(canvas).replaceWith("<video width='450', height='450', autoplay></video>")
        video = document.querySelector('video');
    };

    navigator.getUserMedia  = navigator.getUserMedia ||navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;


    if (navigator.getUserMedia) {
        navigator.getUserMedia({audio: false, video: true}, function(stream) {
                video.src = window.URL.createObjectURL(stream);
        }, function (err){
            console.log("ERROR!", err);
        });
    }
    var capturing = true;
}
