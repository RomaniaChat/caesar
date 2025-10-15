/*  
*   RadioClick KiwiIRC Plugin www.RadioClick.ro
*   plugin-radioclick v2.0.0 - 11/10/2025
*
*   Title = Afiseaza titlul melodiei
*   Art = Afiseaza imaginea melodiei
*   Listeners = Arata ascultători
*   Play = Porneste automat la intrare radio-ul
*
*   RomaniaChat team BaiatRau
*   https://github.com/RomaniaChat
*
*/

(() => {
  console.log("Plugin Radio încărcat");

  kiwi.plugin("radio", (kiwi, log) => {
    log("Inițializare plugin radio");

    // Funcție pentru a încărca configurațiile din radioclick.json
    function loadConfig() {
      return fetch('/static/plugins/radioclick/radioclick.json') // Ajustează calea conform structurii tale
        .then(response => {
          if (!response.ok) throw new Error('Răspunsul rețelei nu este ok');
          return response.json();
        })
        .then(config => {
          console.log("Configurație încărcată din radioclick.json:", config);
          return config;
        })
        .catch(error => {
          console.error("Eșec la încărcarea radioclick.json, se folosesc valorile implicite:", error);
          return {
            showTitle: true,
            showArt: true,
            showDjUsername: false,
            showListeners: false,
            autoPlay: false
          };
        });
    }

    // Injectare stiluri CSS cu fundal transparent, zoom, imagini și titlu în mișcare permanentă
    const style = document.createElement("style");
    style.textContent = `
      .p-radio-controls {
        position: relative;
        padding: 10px;
        background: transparent; /* Fundal transparent fără !important */
        color: #e0e0e0; /* Culoare text cu contrast bun */
        overflow: hidden;
        border-radius: 4px;
        box-sizing: border-box; /* Asigură că padding-ul nu afectează dimensiunea */
      }
      .p-radio-buttons {
        display: inline-flex;
        gap: 4px;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
      }
      .p-radio-buttons > div {
        padding: 2px;
        cursor: pointer;
        color: #bbb; /* Culoare pictograme implicită */
      }
      .p-radio-buttons > div:hover {
        color: #fff; /* Evidențiere la trecerea mouse-ului */
      }
      .p-radio-volume {
        position: relative;
      }
      .p-radio-volume:hover .p-radio-volume-container {
        display: inherit;
      }
      .p-radio-volume-container {
        position: absolute;
        top: 10px;
        left: -4px;
        display: none;
        transform: rotate(270deg);
        transform-origin: 0% 0%;
      }
      .p-radio-volume-container:hover {
        display: inherit;
      }
      .p-radio-volume-slider {
        width: 80px;
        height: 6px;
        margin: 12px;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        cursor: pointer;
        background: rgba(0, 0, 0, 0);
      }
      .p-radio-volume-slider:focus {
        outline: none;
      }
      .p-radio-volume-slider::-webkit-slider-runnable-track {
        height: 0.5rem;
        background-color: #555; /* Bară volum vizibilă */
        border-radius: 0.5rem;
      }
      .p-radio-volume-slider::-webkit-slider-thumb {
        width: 1rem;
        height: 1rem;
        margin-top: -4px;
        -webkit-appearance: none;
        appearance: none;
        background-color: #4caf50; /* Deget volum */
        border-radius: 50%;
      }
      .p-radio-volume-slider::-moz-range-track {
        height: 0.5rem;
        background-color: #555; /* Bară volum vizibilă */
        border-radius: 0.5rem;
      }
      .p-radio-volume-slider::-moz-range-thumb {
        width: 1rem;
        height: 1rem;
        background-color: #4caf50; /* Deget volum */
        border: none;
        border-radius: 50%;
      }
      .p-radio-station {
        margin-top: 5px;
      }
      .p-radio-metadata {
        margin-top: 5px;
        font-size: 0.9em;
        position: relative;
      }
      .p-radio-title {
        font-weight: bold;
        display: block;
        max-width: 200px; /* Limitare lățime maximă */
        overflow: hidden; /* Ascunde textul care depășește */
        position: relative; /* Context pentru animație */
      }
      .p-radio-title .marquee-text {
        display: inline-block;
        white-space: nowrap; /* Previne ruperea liniei */
        animation: marquee 10s linear infinite; /* Animație de deplasare permanentă */
        padding-left: 100%; /* Asigură spațiu pentru deplasare */
      }
      /* Animație pentru titlul în mișcare */
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
      }
      .p-radio-art {
        position: relative;
        display: inline-block;
      }
      .p-radio-art img {
        margin: 5px 0;
        border-radius: 5px; /* Formă rectangulară cu colțuri rotunjite */
        width: 80px; /* Ajustare dimensiune */
        height: 80px; /* Ajustare dimensiune */
        object-fit: cover; /* Asigură că imaginea se potrivește bine */
        transition: transform 0.3s ease; /* Tranziție lină pentru zoom */
      }
      .p-radio-art img:hover {
        transform: scale(2.25); /* Zoom de 25% la trecerea mouse-ului */
      }
      .p-radio-dj, .p-radio-listeners, .p-radio-channels {
        display: block;
      }
      .p-radio-browser {
        display: grid;
        grid-template-columns: max-content auto;
        row-gap: 10px;
        padding: 10px;
        overflow-y: auto;
        background: rgba(128, 128, 128, 0.2);
        max-height: 400px;
      }
      .p-radio-image {
        min-height: 114px;
      }
      .p-radio-image img {
        /* max-width: 100px; /* Ajustare dimensiune */
        max-height: 100px; /* Ajustare dimensiune */
        border-radius: 5px; /* Formă rectangulară cu colțuri rotunjite */
        margin: 7px 7px 0 7px;
        object-fit: cover; /* Asigură că imaginea se potrivește bine */
      }
      .p-radio-image img.p-radio-loaded {
        margin: 7px 7px 0 7px;
      }
      .p-radio-details {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 4px 10px;
      }
      .p-radio-details-play {
        display: inline-block;
        padding: 2px;
        cursor: pointer;
      }
      .p-radio-browser-close {
        display: none;
        grid-column: span 2;
      }
      .p-radio-browser-close > div {
        float: right;
        padding: 0 6px;
        font-weight: 600;
        color: var(--brand-default-bg, #fff);
        cursor: pointer;
        background: var(--brand-error, #bf5155);
      }
      @media screen and (max-width: 769px) {
        .p-radio-browser-close { display: initial; }
      }
    `;
    document.head.appendChild(style);

    // Starea reactivă cu Vue
    const vm = new kiwi.Vue({
      data() {
        return {
          playing: false,
          stationName: "RadioClick",
          stationsList: [
            {
              name: "RadioClick Romania",
              image: "static/plugins/radioclick/radioclick.webp",
              source: "https://live.radioclick.ro:8008/rs",
              description: "🎧 RadioClick Romania www.radioclick.ro",
              channels: ["#RadioClick"]
            },
            {
              name: "RadioClick",
              image: "static/plugins/radioclick/radioclick-romania.webp",
              source: "https://sonicssl.namehost.ro/8008/stream",
              description: "🎧 RadioClick Romania www.radioclick.ro",
              channels: ["#Romania"]
            }
          ],
          stationActive: null,
          metadata: {
            title: "Încărcare...",
            art: "",
            djusername: "",
            listeners: 0
          },
          volume: 0.5,
          muted: false,
          showTitle: true,
          showArt: true,
          showDjUsername: false,
          showListeners: false,
          autoPlay: false,
          audio: null // Referință directă la elementul audio
        };
      },
      methods: {
        togglePlay() {
          this.playing = !this.playing;
          console.log("Redare/Pauză:", this.playing);
          if (this.playing && this.stationActive) {
            this.playStation();
          } else {
            this.pauseStation();
          }
        },
        stopStation() {
          console.log("Oprire stație");
          if (this.audio) {
            this.audio.pause();
            this.audio = null;
            this.playing = false;
          }
        },
        skipStation(direction) {
          console.log("Sărire stație:", direction);
          const currentIndex = this.stationsList.findIndex(s => s.name === this.stationName);
          const newIndex = (currentIndex + direction + this.stationsList.length) % this.stationsList.length;
          this.stationName = this.stationsList[newIndex].name;
          this.stationActive = this.stationsList[newIndex];
          this.playStation();
        },
        toggleMute() {
          this.muted = !this.muted;
          console.log("Mut:", this.muted);
          if (this.audio) {
            this.audio.muted = this.muted;
          }
        },
        updateVolume(event) {
          const volume = parseFloat(event.target.value);
          this.volume = volume;
          console.log("Volum ajustat la:", volume);
          if (this.audio) {
            this.audio.volume = volume;
          }
        },
        playStation(station) {
          console.log("Redare stație:", station ? station.name : this.stationActive.name);
          this.stationActive = station || this.stationActive;
          if (this.stationActive) {
            if (this.audio) {
              this.audio.pause();
              this.audio = null;
            }
            this.audio = new Audio(this.stationActive.source);
            this.audio.volume = this.volume;
            this.audio.muted = this.muted;
            this.audio.setAttribute('disableRemotePlayback', 'true'); // Evită controale externe
            this.audio.play().catch(err => {
              console.error("Eroare la redare:", err);
              if (this.autoPlay) {
                this.$nextTick(() => {
                  this.showAutoplayMessage = "Redarea a fost blocată. Apăsați 'Redare' pentru a începe.";
                });
              }
            });
            this.stationName = this.stationActive.name;
            this.playing = true;
          }
        },
        pauseStation() {
          if (this.audio) {
            this.audio.pause();
            this.playing = false;
          }
        },
        fetchMetadata() {
          fetch("https://api-radio.showchat.eu.org/")
            .then(res => res.json())
            .then(data => {
              this.metadata.title = data.current_song || "Fără titlu";
              this.metadata.art = data.artwork_url || "";
              this.metadata.djusername = data.stream_name || "";
              this.metadata.listeners = data.current_listeners || 0;
            })
            .catch(err => console.error("Eroare la preluarea metadatelor:", err));
        },
        toggleStationsList() {
          console.log("Încercare de comutare a listei de stații");
          try {
            const isOpen = document.body.querySelector(".p-radio-browser");
            if (isOpen) {
              console.log("Închidere vizualizare");
              kiwi.showView(null);
            } else {
              console.log("Deschidere vizualizare");
              kiwi.showView("RadioStations");
              if (kiwi.state.ui.is_narrow) kiwi.state.$emit("statebrowser.hide");
            }
          } catch (e) {
            console.error("Eroare la comutarea listei de stații:", e);
          }
        }
      },
      created() {
        loadConfig().then(config => {
          this.showTitle = config.showTitle !== undefined ? config.showTitle : true;
          this.showArt = config.showArt !== undefined ? config.showArt : true;
          this.showDjUsername = config.showDjUsername !== undefined ? config.showDjUsername : false;
          this.showListeners = config.showListeners !== undefined ? config.showListeners : false;
          this.autoPlay = config.autoPlay !== undefined ? config.autoPlay : false;
          console.log("Configurație aplicată:", { showTitle: this.showTitle, showArt: this.showArt, showDjUsername: this.showDjUsername, showListeners: this.showListeners, autoPlay: this.autoPlay });
          this.stationActive = this.stationsList[0];
          this.stationName = this.stationActive.name;
          this.fetchMetadata();
          setInterval(this.fetchMetadata, 10000);
          if (this.autoPlay) {
            this.playStation();
          }
        });
      }
    });

    // Component RadioControls
    const RadioControls = {
      render(h) {
        return h("div", { class: "p-radio-controls" }, [
          h("div", { class: "p-radio-buttons" }, [
            h("div", { attrs: { title: "Înapoi" }, on: { click: () => vm.skipStation(-1) } }, [
              h("i", { class: "fa fa-fast-backward fa-fw" })
            ]),
            h("div", { attrs: { title: vm.playing ? "Pauză" : "Redare" }, on: { click: vm.togglePlay } }, [
              h("i", { class: `fa ${vm.playing ? "fa-pause" : "fa-play"} fa-fw` })
            ]),
            h("div", { attrs: { title: "Oprire" }, on: { click: vm.stopStation } }, [
              h("i", { class: "fa fa-stop fa-fw" })
            ]),
            h("div", { attrs: { title: "Înainte" }, on: { click: () => vm.skipStation(1) } }, [
              h("i", { class: "fa fa-fast-forward fa-fw" })
            ]),
            h("div", { attrs: { title: "Listă stații" }, on: { click: vm.toggleStationsList } }, [
              h("i", { class: "fa fa-th-list fa-fw" })
            ]),
            h("div", { class: "p-radio-volume" }, [
              h("div", {
                attrs: { title: vm.muted ? "Activați sunetul" : "Dezactivați sunetul" },
                on: { click: vm.toggleMute }
              }, [
                h("i", { class: `fa ${vm.muted ? "fa-volume-off" : "fa-volume-up"} fa-fw` })
              ]),
              h("div", { class: "p-radio-volume-container" }, [
                h("input", {
                  class: "p-radio-volume-slider",
                  attrs: { type: "range", min: "0", max: "1", step: "0.1", value: vm.volume },
                  on: { input: vm.updateVolume }
                })
              ])
            ])
          ]),
          h("div", { class: "p-radio-station" }, [
            vm.stationName,
            h("div", { class: "p-radio-metadata" }, [
              vm.showTitle ? h("span", { class: "p-radio-title" }, [
                h("span", { class: "marquee-text" }, [vm.metadata.title])
              ]) : null,
              vm.showArt && vm.metadata.art ? h("div", { class: "p-radio-art" }, [
                h("img", { attrs: { src: vm.metadata.art + "?r=" + new Date().getTime(), height: "50" } })
              ]) : null,
              vm.showDjUsername ? h("span", { class: "p-radio-dj" }, ["DJ: " + vm.metadata.djusername]) : null,
              vm.showListeners ? h("span", { class: "p-radio-listeners" }, ["Ascultători: " + vm.metadata.listeners]) : null
            ])
          ])
        ]);
      }
    };

    // Component RadioBrowser cu canale
    const RadioBrowser = {
      render(h) {
        console.log("Rendare RadioBrowser");
        return h("div", { class: "p-radio-browser" }, [
          h("div", { class: "p-radio-browser-close" }, [
            h("div", {
              class: "u-button-secondary",
              attrs: { title: "Închide" },
              on: { click: () => vm.toggleStationsList() }
            }, [h("i", { class: "fa fa-times" })])
          ]),
          vm.stationsList.map((station, index) => [
            h("div", { key: `station-img-${index}`, class: "p-radio-image" }, [
              h("img", { attrs: { src: station.image, alt: "" }, on: { load: (e) => e.target.classList.add("p-radio-loaded") } })
            ]),
            h("div", { key: `station-details-${index}`, class: "p-radio-details" }, [
              h("div", { class: "p-radio-details-play" }, [
                h("button", { on: { click: () => { vm.playStation(station); vm.toggleStationsList(); } } }, "Redare")
              ]),
              h("span", { class: "p-radio-details-title" }, [station.name]),
              h("div", { class: "p-radio-description" }, [station.description]),
              h("span", { class: "p-radio-channels" }, [
                (station.channels || []).join(", ")
              ])
            ])
          ])
        ]);
      }
    };

    // Înregistrare vizualizări
    kiwi.addView("RadioStations", RadioBrowser);

    // Adăugare la UI
    kiwi.addUi("browser", RadioControls, { props: { radioAPI: vm } });
    console.log("Componenta adăugată la UI");
  });

})();
