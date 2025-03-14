import zipfile
import os
import json
import requests

def download_mods(modpack_file, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract the .mrpack file
    with zipfile.ZipFile(modpack_file, 'r') as zip_ref:
        zip_ref.extractall(output_dir)
    
    # Load mod metadata
    index_file = os.path.join(output_dir, 'modrinth.index.json')
    if not os.path.exists(index_file):
        print("No modrinth.index.json file found.")
        return
    
    with open(index_file) as f:
        modpack_data = json.load(f)
    
    mods_dir = os.path.join(output_dir, 'mods')
    os.makedirs(mods_dir, exist_ok=True)
    
    # Download mods
    for mod in modpack_data['files']:
        url = mod['downloads'][0]
        filename = os.path.join(mods_dir, mod['path'])
        print(f"Downloading: {url}")
        response = requests.get(url)
        with open(filename, 'wb') as file:
            file.write(response.content)
    
    print("All mods downloaded successfully!")

if __name__ == "__main__":
    modpack_file = 'modpack.mrpack'  # Replace with your .mrpack file
    output_dir = 'extracted'
    download_mods(modpack_file, output_dir)
