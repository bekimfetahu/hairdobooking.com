path = '/home/bekim/projects/hairdobooking.com/src/app/salon/[slug]/page.js'

with open(path, 'r') as f:
    content = f.read()

# Remove the stray "}\n  });\n" left from deleted selectedDate useState
content = content.replace(
    '  const [salon, setSalon] = useState(null);\n}\n  });\n',
    '  const [salon, setSalon] = useState(null);\n',
    1
)

with open(path, 'w') as f:
    f.write(content)

print('OK - stray brackets removed')
