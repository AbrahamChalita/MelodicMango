import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  IconButton,
  Slider,
  Stack,
  LinearProgress,
} from "@mui/material";
import { Song } from "./types";
import PlayIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUp from "@mui/icons-material/VolumeUp";
import VolumeDown from "@mui/icons-material/VolumeDown";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

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
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % playlist.length);
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
    if (audioPlayerRef.current) {
      const currentTime = audioPlayerRef.current.currentTime;
      setSongTime(currentTime);
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.addEventListener("timeupdate", handleTime);
    }

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.removeEventListener("timeupdate", handleTime);
      }
    };
  }, [currentSongIndex, songTime]);

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
    "https://i.pinimg.com/originals/ee/8f/98/ee8f9893298f5d33d7dbc4cb44d30a93.gif",
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

  return (
    <Box
      textAlign="center"
      p={2}
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
      {playlist.length > 0 && (
        <Card
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(5px)",
            borderRadius: "10px",
            padding: "20px",
            width: "25%",
            "@media (max-width: 768px)": {
              width: "100%",
              height: "25%",
            },
            "@media (max-width: 1024px)": {
              width: "100%",
              height: "25%",
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                fontFamily: "Trebuchet MS",
                fontStyle: "normal",
                fontSize: "1.5rem",
                color: "#000000",
                "@media (max-width: 768px)": {
                  fontSize: "1.5rem",
                },
              }}
            >
              {playlist[currentSongIndex].title}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Trebuchet MS",
                fontStyle: "normal",
                fontSize: "1rem",
                letterSpacing: "0.25px",
                color: "#000000",
              }}
            >
              {playlist[currentSongIndex].artist}
            </Typography>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              mt={2}
            >
              <Box display="flex" alignItems="center">
                <Typography variant="body2" component="span">
                  {formatTime(songTime)}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1, ml: 2, mr: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(songTime / playlist[currentSongIndex].duration) * 100}
                  sx={{ width: "100%" }}
                />
              </Box>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" component="span">
                  {formatTime(playlist[currentSongIndex].duration)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
          <Box
            display="flex"
            alignItems="center"
            sx={{
              paddingRight: "0.5rem",
            }}
          >
            <IconButton
              onClick={() =>
                handlePreviousSong()
              }
            >
              <NavigateBeforeIcon />
            </IconButton>
            {loading ? (
              <CircularProgress />
            ) : (
              <IconButton
                onClick={togglePlayPause}
                disabled={playlist.length === 0}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(5px)",
                  padding: "20px",
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
            )}

            <IconButton
              onClick={() =>
                handleNextSong()
              }
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>
          <audio
            ref={audioPlayerRef}
            //controls
            onEnded={handleSongEnded}
          />
        </Card>
      )}
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
        <Stack
          spacing={2}
          direction="column"
          sx={{
            mb: 1,
            alignItems: "center",
            marginLeft: "auto",
          }}
          alignItems="center"
        >
          <IconButton>
            <VolumeUp sx={{ color: "white" }} />
          </IconButton>
          <Slider
            aria-label="Volume"
            value={volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.01}
            sx={{ height: 100, color: "white" }}
            orientation="vertical"
          />
          <IconButton>
            <VolumeDown sx={{ color: "white" }} />
          </IconButton>
        </Stack>
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
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
