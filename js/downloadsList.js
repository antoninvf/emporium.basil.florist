// Fills a <tbody> with an id downloadList with download links from files.flwn.dev/chutoy/mc

// Get the <tbody> element
var downloadList = document.getElementById("downloadList");
var loadingToRemove = document.getElementById("loadingToRemove");
var pleaseWait = document.getElementById("pleaseWait");
var loadingGif = document.getElementById("loadingGif");
var underText = document.getElementById("underText");
var selectors = document.getElementById("selectors");

var versionSelect = document.getElementById("versionSelect");
var categorySelect = document.getElementById("categorySelect");

// On select change, remove all the download links and fetch the new ones

$('#versionSelect').on('select2:select', function (e) {
    var data = e.params.data;
    downloadList.innerHTML = "";
    loadingToRemove.classList.remove("d-none");
    if (data.id.includes("All")) {
        GetDownloads("");
    } else {
        GetDownloads("/" + data.id);
    }
});

// wait for 0.5 seconds before fetching the download links

fetch("https://api.flwn.dev/chutoyemporium/mc/versions")
    .then(response => response.json()).catch(error => {
        selectors.remove();
    })
    .then(versions => {
        versionSelect.innerHTML += `<option value="All Versions">All Versions</option>`;
        for (var i = 0; i < versions.length; i++) {
            versionSelect.innerHTML += `<option value="${versions[i]}">${versions[i]}</option>`;
        }
    });

window.onload = GetDownloads("");
// Fetch the download links from rest api https://api.flwn.dev/chutoyemporium/mcdownloads
function GetDownloads(v) {
    fetch("https://api.flwn.dev/chutoyemporium/mc" + v)
        .then(response => response.json()).catch(error => {
            pleaseWait.innerText = "Something went wrong, please try again later.";
            loadingGif.setAttribute("src", "https://media.tenor.com/w4zAod6JGj8AAAAC/yakuza-kiryu.gif");
            underText.innerText = `Cannot reach the API\n (${error.message})`;
        })
        .then(data => {
            // Sort the data by newest unix timestamp first, and if the name includes OLD, put it at the bottom as well
            data.sort((a, b) => {
                if (a.fileName.includes("OLD") && !b.fileName.includes("OLD")) {
                    return 1;
                } else if (!a.fileName.includes("OLD") && b.fileName.includes("OLD")) {
                    return -1;
                } else {
                    return b.unixTimestamp - a.unixTimestamp;
                }
            });

            // Fill the <tbody> with the download links	
            setTimeout(() => {
                selectors.classList.remove("d-none");

                for (var i = 0; i < data.length; i++) {

                    var iconUrl = "https://files.flwn.dev/chutoy/mc/icons/missing.jpg"
                    if (data[i].category.includes("Prism")) {
                        iconUrl = "https://files.flwn.dev/chutoy/mc/icons/prism.png"
                    }

                    var buttonStyle = "btn-primary";
                    var oldOpacity = "";
                    if (data[i].fileName.includes("OLD")) {
                        buttonStyle = "btn-warning";
                        oldOpacity = "opacity-75";
                    }

                    var d = new Date(data[i].unixTimestamp * 1000);
                    var date = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);

                    downloadList.innerHTML += `
                <div class="bg-light downloadRow d-flex ${oldOpacity} align-items-center rounded">
                    <p class="w-75 me-5"><img src="${data[i].iconLink}" id="iconNum${i}" onerror="this.onerror=null;this.src='${iconUrl}';" width="50px" height="50px" class="rounded me-2">${data[i].fileName}</p>
                    <p class="w-25 me-5">${data[i].category}</p>
                    <p class="w-25">${date}</p>
                    <a href="${data[i].downloadLink}" class="btn ${buttonStyle} ms-auto me-0">Download</a>
                </div>
                `;
                }
                loadingToRemove.classList.add("d-none");
            }, 500);
        });
}
