var podcastInput = $("#pod");
var musicInput = $("#tunes");
var audiobookInput = $("#book");
var gameInput = $("#game");
var saveButton = $("#save");
console.log(saveButton);

function loadEntertainment() {
    var savedPodcasts = localStorage.getItem("podcasts"); 
    if (savedPodcasts) {
        podcastInput.val(savedPodcasts);
    } else {
        podcastInput.val("What's today's podcast?")
    }
    var savedMusic = localStorage.getItem("music");
    if (savedMusic) {
        musicInput.val(savedMusic);
    } else {
        musicInput.val("What music are you feeling today?")
    }
    var savedBooks = localStorage.getItem("audiobook");
    if (savedBooks) {
        audiobookInput.val(savedBooks);
    } else {
        audiobookInput.val("What's today's book?");
    }
    var savedGames = localStorage.getItem("games");
    if (savedGames) {
        gameInput.val(savedGames);
    } else {
        gameInput.val("Is today a game day?");
    }
}

function saveEntertainment() {
    localStorage.setItem("podcasts", podcastInput.val());
    localStorage.setItem("music", musicInput.val());
    localStorage.setItem("audiobook", audiobookInput.val());
    localStorage.setItem("games", gameInput.val());
}

loadEntertainment();
saveButton.on("click", saveEntertainment);