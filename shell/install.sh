#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color


add_to_path() {
    local dir="$1"
    if [[ ":$PATH:" != *":$dir:"* ]]; then
        echo -e "${YELLOW}Adding $dir to PATH${NC}"
        export PATH="$dir:$PATH"
        echo "export PATH=\"$dir:\$PATH\"" >> ~/.bashrc
    fi
}

# Comprehensive dependency check
check_deps() {
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}Python3 not found! Installing...${NC}"
        if command -v winget &> /dev/null; then
            winget install --id=Python.Python.3.10 -e
            # Add Python to PATH
            local python_path="$(cmd //c 'where python' 2>/dev/null | head -1 | sed 's/python.exe//')"
            if [ -n "$python_path" ]; then
                add_to_path "$(cygpath -u "$python_path")"
            fi
        else
            echo -e "${RED}Could not install Python automatically. Please install it manually.${NC}"
            exit 1
        fi
    fi

    # Check FFmpeg
    if ! command -v ffmpeg &> /dev/null; then
        echo -e "${RED}FFmpeg not found! Installing...${NC}"
        if command -v winget &> /dev/null; then
            winget install --id=Gyan.FFmpeg -e
            # Add FFmpeg to PATH
            local ffmpeg_path="/usr/bin/ffmpeg"
            if [ -f "$ffmpeg_path" ]; then
                add_to_path "$(dirname "$ffmpeg_path")"
            else
                echo -e "${YELLOW}FFmpeg installed but path not automatically detected. Please add it manually.${NC}"
            fi
        else
            echo -e "${RED}Could not install FFmpeg automatically. Please install it manually.${NC}"
            exit 1
        fi
    fi

    # Check Python modules
    if ! python3 -c "import yt_dlp" &> /dev/null; then
        echo -e "${RED}yt_dlp module not found! Installing...${NC}"
        pip install yt-dlp
    fi

    # Verify everything is working
    echo -e "${MAGENTA}Verifying installations...${NC}"
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}Python installation failed!${NC}"
        exit 1
    fi
    if ! command -v ffmpeg &> /dev/null; then
        echo -e "${RED}FFmpeg installation failed!${NC}"
        exit 1
    fi
    if ! python3 -c "import yt_dlp" &> /dev/null; then
        echo -e "${RED}yt_dlp installation failed!${NC}"
        exit 1
    fi
    echo -e "${GREEN}All dependencies verified!${NC}"
}


progress_bar() {
    local duration=${1:-10}
    local width=${2:-50}
    local fill=${3:-"█"}
    local empty=${4:-"-"}
    local start_time=$(date +%s)
    
    for ((i=0; i<=duration; i++)); do
        # Calculate progress
        percent=$((i * 100 / duration))
        filled=$((i * width / duration))
        empty_len=$((width - filled))
        
        # Calculate ETA
        current_time=$(date +%s)
        elapsed=$((current_time - start_time))
        if ((i > 0)); then
            total_estimated=$((elapsed * duration / i))
            remaining=$((total_estimated - elapsed))
            eta=$(date -d "@$((current_time + remaining))" "+%H:%M:%S")
        else
            eta="Calculating..."
        fi
        
        # Color changes
        if ((percent < 30)); then
            color=$RED
        elif ((percent < 70)); then
            color=$YELLOW
        else
            color=$GREEN
        fi
        
        printf "\r${CYAN}Progress:${NC} ${color}[%${filled}s%${empty_len}s]${NC} ${percent}%% ${BLUE}ETA: ${eta}${NC}" \
               "${fill}" "${empty}"
        sleep 1
    done
    printf "\n"
}

# Main function
main() {
    clear
    echo -e "${BLUE}┌────────────────────────────────────┐${NC}"
    echo -e "${BLUE}│   ${GREEN}YouTube Download Manager Pro   ${BLUE}│${NC}"
    echo -e "${BLUE}└────────────────────────────────────┘${NC}"
    
    check_deps
    
    # Create organized download directory
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    local download_dir="downloads/$timestamp"
    mkdir -p "$download_dir"
    
    while true; do
        echo -e "\n${YELLOW}Main Menu:${NC}"
        PS3="$(echo -e ${GREEN}"Select an option (1-4): "${NC})"
        options=(
            "Download Audio" 
            "Download Video" 
            "Download Playlist" 
            "Change Download Directory" 
            "Exit"
        )
        
        select opt in "${options[@]}"; do
            case $opt in
                "Download Audio")
                    read -p "$(echo -e ${YELLOW}"Enter audio URL: "${NC})" url
                    echo -e "${CYAN}Starting audio download...${NC}"
                    (python3 audio.py "$url" "$download_dir" &> /dev/null) &
                    pid=$!
                    progress_bar 15 &
                    progress_pid=$!
                    wait $pid
                    kill $progress_pid 2> /dev/null
                    echo -e "\n${GREEN}✓ Audio download complete!${NC}"
                    echo -e "${BLUE}Files saved to:${NC} $(realpath "$download_dir")"
                    ls -lh "$download_dir" | awk 'NR>1 {print $9 " (" $5 ")"}'
                    break
                    ;;
                    
                "Download Video")
                    read -p "$(echo -e ${YELLOW}"Enter video URL: "${NC})" url
                    echo -e "${CYAN}Starting video download...${NC}"
                    (python3 video.py "$url" "$download_dir" &> /dev/null) &
                    pid=$!
                    progress_bar 20 &
                    progress_pid=$!
                    wait $pid
                    kill $progress_pid 2> /dev/null
                    echo -e "\n${GREEN}✓ Video download complete!${NC}"
                    echo -e "${BLUE}Files saved to:${NC} $(realpath "$download_dir")"
                    ls -lh "$download_dir" | awk 'NR>1 {print $9 " (" $5 ")"}'
                    break
                    ;;
                    
                "Download Playlist")
                    read -p "$(echo -e ${YELLOW}"Enter playlist URL: "${NC})" url
                    echo -e "${CYAN}Starting playlist download...${NC}"
                    (python3 playlist.py "$url" "$download_dir" &> /dev/null) &
                    pid=$!
                    progress_bar 30 &
                    progress_pid=$!
                    wait $pid
                    kill $progress_pid 2> /dev/null
                    echo -e "\n${GREEN}✓ Playlist download complete!${NC}"
                    echo -e "${BLUE}Files saved to:${NC} $(realpath "$download_dir")"
                    ls -lh "$download_dir" | awk 'NR>1 {print $9 " (" $5 ")"}'
                    break
                    ;;
                    
                "Change Download Directory")
                    read -p "$(echo -e ${YELLOW}"Enter new directory path: "${NC})" new_dir
                    download_dir="$new_dir"
                    mkdir -p "$download_dir"
                    echo -e "${GREEN}Download directory changed to:${NC} $(realpath "$download_dir")"
                    break
                    ;;
                    
                "Exit")
                    echo -e "${BLUE}Thank you for using YouTube Download Manager!${NC}"
                    exit 0
                    ;;
                    
                *) 
                    echo -e "${RED}Invalid option. Please select 1-5.${NC}"
                    ;;
            esac
        done
    done
}

# Run main function
main