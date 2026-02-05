"use client"; // important: make this a client component

import { useEffect, useState, useRef } from "react";
import "./globals.css"; // your CSS


export default function Home() {
  const [songs, setSongs] = useState([]); // current playlist
  const [currFolder, setCurrFolder] = useState("cs"); // default folder
  const [currentTrack, setCurrentTrack] = useState(""); // current song name
  const [isPlaying, setIsPlaying] = useState(false); // play/pause
  const [volume, setVolume] = useState(0.5); // 0 to 1
  const [volumeIcon, setVolumeIcon] = useState("/images/volume.svg");
  const [prevVolume, setPrevVolume] = useState(0.5); // store previous volume before mute
  const audioRef = useRef(null); // reference to Audio object



  const [albums, setAlbums] = useState([]);

useEffect(() => {
  async function loadAlbums() {
    // manually list your folders here (or generate with JSON later)
    const albumFolders = ["cs", "Angry", "Calm", "Friends", "Happy", "Heart", "Joy","Lonely", "ncs", "Sad", "Upset"]; // add all folder names here
    const albumData = [];

    for (let folder of albumFolders) {
      try {
        const res = await fetch(`/songs/${folder}/info.json`);
        const data = await res.json();
        albumData.push({ folder, ...data });
      } catch (err) {
        console.error("Failed to load album:", folder, err);
      }
    }

    setAlbums(albumData);
  }

  loadAlbums();
}, []);


  // Load Audio on client
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    // update song time
    audioRef.current.addEventListener("timeupdate", () => {
      const seek = document.querySelector(".circle");
      const songtime = document.querySelector(".songtime");
      if (audioRef.current.duration) {
        const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        if (seek) seek.style.left = percent + "%";
        if (songtime) {
          songtime.innerHTML = `${formatSecondsToMinutes(audioRef.current.currentTime)} / ${formatSecondsToMinutes(audioRef.current.duration)}`;
        }
      }
    });

    return () => {
      audioRef.current.pause();
      audioRef.current.src = "";
    };
  }, []);

  // Format seconds to mm:ss
  function formatSecondsToMinutes(seconds) {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
const toggleMute = () => {
  if (!audioRef.current) return;

  if (audioRef.current.volume > 0) {
    // mute
    setPrevVolume(audioRef.current.volume); // save current volume
    audioRef.current.volume = 0;
    setVolume(0);
    setVolumeIcon("/images/mute.svg");
  } else {
    // unmute
    audioRef.current.volume = prevVolume; // restore previous volume
    setVolume(prevVolume);
    setVolumeIcon("/images/volume.svg");
  }
};

  useEffect(() => {
  async function loadSongs() {
    if (!currFolder) return;
    try {
      const res = await fetch(`/songs/${currFolder}/info.json`);
      const data = await res.json();
      setSongs(data.tracks);
      setCurrentTrack(data.tracks[0]);
      if (audioRef.current) {
        audioRef.current.src = `/songs/${currFolder}/${data.tracks[0]}`;
      }
    } catch (err) {
      console.error("Failed to load songs for folder:", currFolder, err);
    }
  }
  loadSongs();
}, [currFolder]);


  // Play / Pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

// Play selected track
const playTrack = (track) => {
  if (!audioRef.current) return;

  if (track === currentTrack) {
    // If clicking the same track, toggle play/pause
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  } else {
    // New track, load and play
    audioRef.current.src = `/songs/${currFolder}/${track}`;
    audioRef.current.play();
    setCurrentTrack(track);
    setIsPlaying(true);
  }
};

  // Next / Previous
  const nextTrack = () => {
    const idx = songs.indexOf(currentTrack);
    if (idx + 1 < songs.length) playTrack(songs[idx + 1]);
  };
  const prevTrack = () => {
    const idx = songs.indexOf(currentTrack);
    if (idx - 1 >= 0) playTrack(songs[idx - 1]);
  };

const changeVolume = (e) => {
  const val = e.target.value / 100;
  setVolume(val);
  if (audioRef.current) audioRef.current.volume = val;

  // update icon
  if (val === 0) {
    setVolumeIcon("/images/mute.svg");
  } else {
    setVolumeIcon("/images/volume.svg");
    setPrevVolume(val); // store last non-zero volume
  }
};


  // Seek bar click
  const seekBarClick = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const percent = e.nativeEvent.offsetX / e.currentTarget.offsetWidth;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  return (
    <div className="container flex bg-black">
      {/* Left Sidebar */}
      <div className="left">
        <div className="close">
          <img width="30" className="invert" src="/images/close.svg" alt="" />
        </div>
        <div className="home bg-gray rounded m1 p1">
          <div className="logo">
            <img className="invert" src="/images/logo.svg" alt="" />
          </div>
          <ul>
            <li>
              <img className="invert" src="/images/home.svg" alt="Home" /> Home
            </li>
            <li>
              <img className="invert" src="/images/search.svg" alt="Search" /> Search
            </li>
          </ul>
        </div>
        <div className="library bg-black bg-gray rounded m1">
          <div className="heading">
            <img className="invert" src="/images/playlist.svg" alt="" />
            <h2>Your library</h2>
          </div>
          <div className="songlist">

<ul>
  {songs.map((song, idx) => (
    <li key={idx} onClick={() => playTrack(song)}>
      <img className="invert" width="34" src="/images/music.svg" alt="" />
      <div className="info">
        <div>{song}</div>
        <div>Arham</div>
      </div>
      <div className="playnow">
        <span>{currentTrack === song && isPlaying ? "Pause" : "Play now"}</span>
        <img
          className="invert"
          src={
            currentTrack === song
              ? isPlaying
                ? "/images/pause.svg"
                : "/images/play.svg"
              : "/images/play.svg"
          }
          alt=""
        />
      </div>
    </li>
  ))}
</ul>

          </div>

<div className="footer">
  <span><a>Community
    </a></span>
  <span><a>Blog
    </a></span>
  <span><a>Privacy
    </a></span>
  <span><a>About
    </a></span>

</div>
        </div>
      </div>

      {/* Right Main */}
      <div className="right bg-gray rounded">
        <div className="header">
          <div className="nav">
            <div className="hamburgercont">
              <img width="30" className="invert hamburger" src="/images/hamburger.svg" alt="" />
            </div>
          </div>
          <div className="button">
            <button className="signup-btn">Sign up</button>
            <button className="login-btn">Login</button>
          </div>
        </div>

        {/* Playlist */}
        <div className="spotify-playlist">
          <h1>Spotify Playlist</h1>
        <div className="card-container">{/* Optional album cards */}
           {albums.map((album, idx) => (
    <div
      key={idx}
      className="card"
      data-folder={album.folder}
      onClick={() => {
        setCurrFolder(album.folder); // load songs from this album
      }}
    >
      <div className="play">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34">
          <circle cx="12" cy="12" r="12" fill="lime" />
          <path
            d="M15.9453 12.3948C15.7686 13.0215 14.9333 13.4644 13.2629 14.3502C11.648 15.2064 10.8406 15.6346 10.1899 15.4625C9.9209 15.3913 9.6758 15.2562 9.47812 15.0701C9 14.6198 9 13.7465 9 12C9 10.2535 9 9.38018 9.47812 8.92995C9.6758 8.74381 9.9209 8.60868 10.1899 8.53753C10.8406 8.36544 11.648 8.79357 13.2629 9.64983C14.9333 10.5356 15.7686 10.9785 15.9453 11.6052C16.0182 11.8639 16.0182 12.1361 15.9453 12.3948Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <img src={`/songs/${album.folder}/${album.cover}`} alt={album.title} />
      <h2>{album.title}</h2>
      <p>{album.description}</p>
    </div>
  ))}
        </div>

          {/* Playbar */}
          <div className="playbar">
            <div className="seekbar" onClick={seekBarClick}>
              <div className="circle"></div>
            </div>
            <div className="abovebar">
              <div className="songinfo">{currentTrack}</div>
              <div className="songbuttons">
                <img width="35" onClick={prevTrack} src="/images/previous.svg" alt="" />
                <img width="35" onClick={togglePlay} src={isPlaying ? "/images/pause.svg" : "/images/play.svg"} alt="" />
                <img width="35" onClick={nextTrack} src="/images/nextsong.svg" alt="" />
              </div>
              <div className="timevol">
                <div className="songtime">00:00 / 00:00</div>
                <div className="volume">
                 <img
  width="25"
  src={volumeIcon}
  alt="Volume"
  onClick={toggleMute} // <-- toggles mute/unmute
/>

                  <div className="range">
                    <input type="range" min="0" max="100" value={volume * 100} onChange={changeVolume} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
