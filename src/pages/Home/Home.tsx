import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Slider,
  Stack,
  LinearProgress, Modal,
} from "@mui/material";
import { Song } from "./types";
import PlayIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUp from "@mui/icons-material/VolumeUp";
import VolumeDown from "@mui/icons-material/VolumeDown";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CancelIcon from '@mui/icons-material/Cancel';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

const supabaseUrl = "https://dxbolfpjhqnhnwouujcz.supabase.co";
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const Home: React.FC = () => {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.25);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [songTime, setSongTime] = useState<number>(0);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  async function fetchSongs() {
    try {
      setLoading(true);
      let { data: songs, error } = await supabase.from("songs").select("*");

      //   console.log("Songs: ");
      //   console.log(songs);

      if (error) {
        console.error("Error fetching songs: ", error.message);
      } else if (songs) {
        setPlaylist(songs);
      }
    } catch (e: any) {
      console.log("Error fetching songs: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  //   function playCurrentSong() {
  //   try {
  //     const audioPlayer = audioPlayerRef.current;
  //     if (audioPlayer) {
  //       const songIndex = currentSongIndex % playlist.length;
  //       audioPlayer.src = playlist[songIndex]?.file;
  //       audioPlayer.load();
  //       audioPlayer.volume = volume;

  //       audioPlayer.addEventListener("canplaythrough", handleLoadedData);
  //       audioPlayer.addEventListener("error", handleAudioError);
  //     }
  //   } catch (e: any) {
  //     console.log("Error playing song: " + e.message);
  //   }
  // }

  function togglePlayPause() {
    const audioPlayer = audioPlayerRef.current;
    if (audioPlayer) {
      if (!isAudioInitialized) {
        const songIndex = currentSongIndex % playlist.length;
        audioPlayer.src = playlist[songIndex]?.file;
        audioPlayer.load();
        audioPlayer.volume = volume;

        audioPlayer.addEventListener("canplaythrough", handleLoadedData);
        audioPlayer.addEventListener("error", handleAudioError);

        setIsAudioInitialized(true);

        audioPlayer.muted = true;
        audioPlayer.play().then(() => {
          audioPlayer.pause();
          audioPlayer.muted = false;
        });
      } else {
        if (isPlaying) {
          audioPlayer.pause();
        } else {
          audioPlayer.play();
        }
        setIsPlaying(!isPlaying);
      }
    }
  }

  function handleLoadedData() {
    const audioPlayer = audioPlayerRef.current;
    if (audioPlayer) {
      audioPlayer.removeEventListener("canplaythrough", handleLoadedData);
      audioPlayer.play();
      setIsPlaying(true);
    }
  }

  function handleAudioError() {
    console.log("Error playing song");
  }

  function handleSongEnded() {
    const audioPlayer = audioPlayerRef.current;
    if (audioPlayer) {
      const nextIndex = (currentSongIndex + 1) % playlist.length;
      audioPlayer.src = playlist[nextIndex]?.file;
      audioPlayer.load();
      audioPlayer.volume = volume;
      audioPlayer.play();
      setIsPlaying(true);
      setCurrentSongIndex(nextIndex);
    }
  }

  function handleNextSong() {
    const audioPlayer = audioPlayerRef.current;
    const nextIndex = (currentSongIndex + 1) % playlist.length;
    if (audioPlayer) {
      audioPlayer.src = playlist[nextIndex]?.file;
      audioPlayer.load();
      audioPlayer.volume = volume;
      audioPlayer.play();
      setIsPlaying(true);
    }
    setCurrentSongIndex(nextIndex);
  }

  function handlePreviousSong() {
    const audioPlayer = audioPlayerRef.current;
    const previousIndex = (currentSongIndex - 1) % playlist.length;
    if (audioPlayer) {
      audioPlayer.src = playlist[previousIndex]?.file;
      audioPlayer.load();
      audioPlayer.volume = volume;
      audioPlayer.play();
      setIsPlaying(true);
    }
    setCurrentSongIndex(previousIndex);
  }

  function handleVolumeChange(event: any, newValue: number | number[]) {
    const newVolume = typeof newValue === "number" ? newValue : newValue[0];
    setVolume(newVolume as number);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = newVolume;
    }
  }

  function handleTime() {
    const currentAudioPlayer = audioPlayerRef.current;
    if (currentAudioPlayer) {
      const currentTime = currentAudioPlayer.currentTime;
      setSongTime(currentTime);
    }
  }
  

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const currentAudioPlayer = audioPlayerRef.current;
  
    if (currentAudioPlayer) {
      currentAudioPlayer.addEventListener("timeupdate", handleTime);
    }
  
    return () => {
      if (currentAudioPlayer) {
        currentAudioPlayer.removeEventListener("timeupdate", handleTime);
      }
    };
  }, [currentSongIndex, songTime, playlist]);
  

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    if (playlist.length > 0) {
      setIsAudioInitialized(false);
      setCurrentSongIndex(0);
    }
  }, [playlist]);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    };
  }, []);

  const backgrounds = [
    "https://miro.medium.com/v2/resize:fit:1000/0*eIhVp0KXrXSSHORN.gif",
    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c83c004e-1370-4756-88e5-4071de797088/dfwtrdo-80c5b3ae-615f-4074-9f0e-c772659e4e79.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2M4M2MwMDRlLTEzNzAtNDc1Ni04OGU1LTQwNzFkZTc5NzA4OFwvZGZ3dHJkby04MGM1YjNhZS02MTVmLTQwNzQtOWYwZS1jNzcyNjU5ZTRlNzkuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.3iKkKrjeG6eQFUmlq4I48HZ51hGyHGd_qHBelGyZuRo",
    "https://wallpaperaccess.com/full/8351153.gif",
    "https://wallpaperaccess.com/full/849790.gif",
  ];

  function handleNextBackground() {
    setCurrentBackgroundIndex((prevIndex) =>
      prevIndex === backgrounds.length - 1 ? 0 : prevIndex + 1
    );
  }

  function handleBackBackground() {
    setCurrentBackgroundIndex((prevIndex) =>
      prevIndex === 0 ? backgrounds.length - 1 : prevIndex - 1
    );
  }

  const handleSettingsClose = () => {
    setIsSettingsOpen(false)
  }

    const handleSettingsOpen = () => {
    setIsSettingsOpen(true)
    }

  return (
    <Box
      textAlign="center"
      sx={{
        backgroundImage: `url(${backgrounds[currentBackgroundIndex]})`,
        backgroundSize: "cover",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        position="relative"
        alignItems="center"
        justifyContent="center"
        width={{ xs: "90%", sm: "70%", md: 350 }}
        height={{ xs: "40vh", sm: "40vh", md: "40vh" }}
        sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "20px 20px 20px 20px",
            boxShadow: "0px 0px 20px 0px rgba(0,0,0,0.75)",
        }}
        >
        <Typography
            sx={{
              fontWeight: "bold",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontStyle: "normal",
              fontSize: "1.8rem",
              color: "#000000",
              textAlign: "center",
                marginTop: "3rem",
            }}
        >
          {playlist[currentSongIndex] ? playlist[currentSongIndex].title : ""}
        </Typography>
          <Typography
              sx={{
                  fontFamily: "Helvetica, Arial, sans-serif",
                  fontStyle: "normal",
                  fontSize: "1.2rem",
                  letterSpacing: "0.25px",
                  color: "#000000",
              }}
          >
                {playlist[currentSongIndex] ? playlist[currentSongIndex].artist : ""}
          </Typography>
          <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="row"
              mt={2}
              sx={{
                  paddingLeft: "1.5rem",
                  paddingRight: "1.5rem",
                  paddingTop: "1rem",
              }}
          >
              <LinearProgress
                  variant="determinate"
                  value={(songTime / (playlist[currentSongIndex] ? playlist[currentSongIndex].duration : 100)) * 100}
                  sx={{ width: "100%",
                      height: "0.4rem",
                      borderRadius: "2rem",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                  }}
              />
          </Box>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="row"
                mt={2}
                sx={{
                    paddingLeft: "1.6rem",
                    paddingRight: "1.6rem",
                }}
            >
                <Box display="flex" alignItems="center">
                    <Typography variant="body2" component="span"
                        sx={{
                            fontWeight: "bold",
                        }}
                    >
                        {formatTime(songTime)}
                    </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Box display="flex" alignItems="center">
                    <Typography variant="body2" component="span"
                        sx={{
                            fontWeight: "bold",
                        }}
                    >
                        {formatTime((playlist[currentSongIndex] ? playlist[currentSongIndex].duration : 100))}
                    </Typography>
                </Box>
            </Box>
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="row"
            sx={{
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingTop: "1.5rem",
            }}
        >
            <IconButton onClick={() => handlePreviousSong()} sx={{borderRadius: "10%"}}>
                <SkipPreviousIcon
                    sx={{
                        color: "#000000",
                        paddingRight: "1rem",
                    }}
                />
            </IconButton>
            {loading ? (
                <CircularProgress />
            ) : (
                <IconButton
                    onClick={togglePlayPause}
                    disabled={playlist.length === 0}
                    sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        borderRadius: "10%",
                        backdropFilter: "blur(5px)",
                        padding: "20px",
                    }}
                >
                    {isPlaying ?
                        <PauseIcon sx={{ color: "white"}}/>
                        :
                        <PlayIcon sx={{ color: "white"}}/>}
                </IconButton>
            )}

            <IconButton onClick={() => handleNextSong()} sx={{borderRadius: "10%"}}>
                <SkipNextIcon
                    sx={{
                        color: "#000000",
                        paddingLeft: "1rem",

                    }}
                />
            </IconButton>
            <audio
                ref={audioPlayerRef}
                //controls
                onEnded={handleSongEnded}
            />
        </Box>
      </Box>
      <Box
        position="fixed"
        top={30}
        right={10}
        display="flex"
        alignItems="center"
        width={200}
        sx={{
          paddingRight: "20px",
        }}
      >
        <IconButton
          sx={{
            mb: 1,
            alignItems: "center",
            marginLeft: "auto",
          }}
          onClick={handleSettingsOpen}
        >
          <VolumeUp sx={{ color: "white" }} />
        </IconButton>
      </Box>
      <Box
        position="absolute"
        bottom={0}
        right={0}
        p={2}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <IconButton onClick={handleBackBackground}>
          <NavigateBeforeIcon sx={{ color: "white" }} />
        </IconButton>
        <IconButton onClick={handleNextBackground}>
          <NavigateNextIcon sx={{ color: "white" }} />
        </IconButton>
      </Box>
      <Box
        position="absolute"
        bottom={0}
        left={0}
        p={2}
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
      >
        <img
          src="./icon-192.png"
          alt="logo"
          style={{ width: "15%", height: "15%" }}
        />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          ml={2}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              fontFamily: "Trebuchet MS",
              fontStyle: "normal",
              fontSize: "1rem",
              color: "#FFFFFF",
            }}
          >
            Melodic Mango
          </Typography>
          <Typography
            sx={{
                fontFamily: "Trebuchet MS",
                fontStyle: "normal",
                fontSize: "0.75rem",
                letterSpacing: "0.25px",
                color: "#FFFFFF",
                }}
            >
            {playlist.length} songs
            </Typography>
        </Box>
      </Box>
      <Modal open={isSettingsOpen} onClose={handleSettingsClose}>
        <Box
            sx={{
              backgroundSize: "cover",
              height: "100vh",
              width: "100vw",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
            }}
        >

          <Box
              position="relative"
              alignItems="center"
              justifyContent="center"
              width={{ xs: "90%", sm: "70%", md: 350 }}
              height={{ xs: "20vh", sm: "20vh", md: "20vh" }}
              sx={{
                backgroundColor: "transparent",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
          >
            <Stack
              spacing={2}
              direction="row"
              alignItems="center"
              sx={{
                mb: 1,
                position: "absolute",
                width: "100%",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <IconButton>
                <VolumeDown sx={{ color: "white" }} />
              </IconButton>
              <Slider
                aria-label="Volume"
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.01}
                sx={{ height: 15, color: "white" }}
                orientation="horizontal"
              />
              <IconButton>
                <VolumeUp sx={{ color: "white" }} />
              </IconButton>
            </Stack>
            <Box
                position="fixed"
                top={30}
                right={10}
                display="flex"
                alignItems="center"
                width={200}
                sx={{
                  paddingRight: "20px",
                }}
            >
              <IconButton
                  sx={{
                    mb: 1,
                    alignItems: "center",
                    marginLeft: "auto",
                  }}
                  onClick={handleSettingsClose}
              >
                <CancelIcon sx={{ color: "white" }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Home;
