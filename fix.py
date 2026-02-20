import sys

def keep_head(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    out = []
    state = 'NORMAL'
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            state = 'IN_HEAD'
            continue
        elif line.startswith('======='):
            state = 'IN_THEM'
            continue
        elif line.startswith('>>>>>>>'):
            state = 'NORMAL'
            continue
        
        if state == 'NORMAL' or state == 'IN_HEAD':
            out.append(line)
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(out)

for f in ['frontend/src/main.tsx', 'frontend/src/App.tsx', 'frontend/vite.config.ts']:
    keep_head(f)

tsconfig_content = """{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "typeRoots": ["../node_modules/@types"],
    "types": ["node"],
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src", "vite.config.ts"]
}
"""
with open('frontend/tsconfig.json', 'w', encoding='utf-8') as f:
    f.write(tsconfig_content)
