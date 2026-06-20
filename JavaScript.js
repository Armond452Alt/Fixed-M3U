function changeChannel(channelId) {
    var player = videojs('tvpass-player');
    player.src({
        src: 'https://revival.tvpass.org/api/stream?channel=' + channelId,
        type: 'application/x-mpegURL'
    });
    player.play();
}
