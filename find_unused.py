import os
import re

def get_all_files(directory):
    file_list = []
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root or '.git' in root:
            continue
        for file in files:
            file_list.append(os.path.join(root, file))
    return file_list

def find_unused_files(src_dir, root_dir):
    all_files = get_all_files(src_dir)
    # Filter for source files
    src_files = [f for f in all_files if f.endswith(('.js', '.jsx', '.css', '.scss', '.png', '.jpg', '.svg'))]
    
    # Files that are entry points or special
    used_files = {
        os.path.join(src_dir, 'main.jsx'),
        os.path.join(src_dir, 'index.css'),
    }
    
    # Scan all files for imports
    import_patterns = [
        re.compile(r"from\s+['\"]([^'\"]+)['\"]"),
        re.compile(r"import\s+['\"]([^'\"]+)['\"]"),
        re.compile(r"import\(\s*['\"]([^'\"]+)['\"]\s*\)"),
        re.compile(r"require\(\s*['\"]([^'\"]+)['\"]\s*\)")
    ]
    
    for file_path in all_files:
        if not file_path.endswith(('.js', '.jsx', '.html')):
            continue
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                for pattern in import_patterns:
                    for match in pattern.finditer(content):
                        imp_path = match.group(1)
                        # Resolve path relative to file
                        dirname = os.path.dirname(file_path)
                        
                        # Handle aliases or relative paths
                        if imp_path.startswith('.'):
                            # Try to resolve relative path
                            abs_path = os.path.normpath(os.path.join(dirname, imp_path))
                        else:
                            # Might be a node module or special alias
                            continue
                            
                        # Check with various extensions
                        found = False
                        for ext in ['', '.js', '.jsx', '.css', '.png', '.svg', '.jpg']:
                            if os.path.isfile(abs_path + ext):
                                used_files.add(abs_path + ext)
                                found = True
                            # Check if it's a directory with index.js/jsx
                            if os.path.isdir(abs_path) and os.path.isfile(os.path.join(abs_path, 'index' + ext)):
                                used_files.add(os.path.normpath(os.path.join(abs_path, 'index' + ext)))
                                found = True
                        
        except:
            pass
            
    unused = [f for f in src_files if f not in used_files]
    return unused

if __name__ == "__main__":
    src = "d:\\INTERNSHIP\\Vinatge Rides Hub\\src"
    root = "d:\\INTERNSHIP\\Vinatge Rides Hub"
    unused = find_unused_files(src, root)
    print("UNUSED FILES:")
    for f in unused:
        print(f)
