// We initialize Agora's client
var client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});

var options = {
    appId: "ee200330852c43ef89028720af880276",
    uid: null,
    channel: null,
    token: null
}

var localTracks = {
    videoTrack: null,
    audioTrack: null
}

var localTrackState = {
    videoTrackEnabled: true,
    audioTrackEnabled: true
}

var remoteUsers = {};

// Link join function to join button and add channel
$("#join-form").submit(async function (e) { 
    // The default would be to reload the page; we are preventing that
    e.preventDefault();
    $("#join").attr("disabled", true);
    try {
        options.channel = $("#channel").val();
        console.log(options.channel)
        await join();
    } catch (e) {
        console.error(e)
    }
    finally {
        $("#leave").attr("disabled", false)
    }
});

$("#leave").click(function (e) {
    leave();
});

$("#mic-btn").click(function (e) {
    if (localTrackState.audioTrackEnabled) {
        muteAudio();
    } else {
        unmuteAudio();
    }
});

$("#video-btn").click(function (e) {
    if (localTrackState.videoTrackEnabled) {
        muteVideo();
    } else {
        unmuteVideo();
    }
})

async function join() {
    //Add event listener to play remote tracks when remote users join, publish and leave.
    client.on("user-published", handleUserPublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    options.uid = await client.join(options.appId, options.channel, options.token || null);
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();

    showMuteButton();

    localTracks.videoTrack.play("local-player");
    $("#local-player-name").text(`localVideo(${options.uid})`);

    await client.publish(Object.values(localTracks));
    console.log("publish success")
}

async function leave() {
    for (trackName in localTracks) {
        var track = localTracks[trackName];
        if (track) {
            track.stop();
            track.close();
            localTracks[trackName] = undefined;
        }
    }
    // remove remote users and player views
    remoteUsers = {};
    $("#remote-playerlist").html("");
    // leave the channel
    await client.leave();
    $("#local-player-name").text("");
    $("#join").attr("disabled", false);
    $("#leave").attr("disabled", true);
    hideMuteButton();
    console.log("client leaves channel success");
}

async function subscribe(user, mediaType) {
    const uid = user.uid;
    // subscribe to a remote user
    await client.subscribe(user, mediaType);
    console.log("subscribe success");
    // if the video wrapper element does not exist, create it.
    if (mediaType === 'video') {
        if ($(`#player-wrapper-${uid}`).length === 0) {
            const player = $(`
        <div id="player-wrapper-${uid}">
          <br>
          <p id="remote-player-name" class="player-name">remoteUser(${uid})</p>
          <div id="player-${uid}" class="player"></div>
        </div>
      `);
            $("#remote-playerlist").append(player);
        }
        // play the remote video.
        console.log("playing remote")
        user.videoTrack.play(`player-${uid}`);
    }
    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
}

// Handle user joined
function handleUserJoined(user) {
    const id = user.uid;
    remoteUsers[id] = user;
}

// Handle user left
function handleUserLeft(user) {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
}

// Handle user published
function handleUserPublished(user, mediaType) {
    subscribe(user, mediaType);
}

// Hide or show control buttons
function hideMuteButton() {
    $("#video-btn").css("display", "none");
    $("#mic-btn").css("display", "none");
}

function showMuteButton() {
    $("#video-btn").attr("disabled", false);
    $("#mic-btn").attr("disabled", false);
}

// Mute audio and video
async function muteAudio() {
    if (!localTracks.audioTrack) return;
    await localTracks.audioTrack.setEnabled(false);
    localTrackState.audioTrackEnabled = false;
    $("#mic-btn").text("Unmute Audio");
}
async function muteVideo() {
    if (!localTracks.videoTrack) return;
    await localTracks.videoTrack.setEnabled(false);
    localTrackState.videoTrackEnabled = false;
    $("#video-btn").text("Unmute Video");
}

// Unmute audio and video
async function unmuteAudio() {
    if (!localTracks.audioTrack) return;
    await localTracks.audioTrack.setEnabled(true);
    localTrackState.audioTrackEnabled = true;
    $("#mic-btn").text("Mute Audio");
}

async function unmuteVideo() {
    if (!localTracks.videoTrack) return;
    await localTracks.videoTrack.setEnabled(true);
    localTrackState.videoTrackEnabled = true;
    $("#video-btn").text("Mute Video");
}