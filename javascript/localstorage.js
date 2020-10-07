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
    }
    
    var savedMusic = localStorage.getItem("music");
    if (savedMusic) {
        musicInput.val(savedMusic);
    }
    var savedBooks = localStorage.getItem("audiobook");
    if (savedBooks) {
        audiobookInput.val(savedBooks);
    }
    var savedGames = localStorage.getItem("games");
    if (savedGames) {
        gameInput.val(savedGames);
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