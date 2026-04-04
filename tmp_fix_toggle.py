path = '/home/bekim/projects/hairdobooking.com/src/app/salon/[slug]/page.js'

with open(path, 'r') as f:
    content = f.read()

# Fix the mangled toggle line
old = 'onClick={() => dispatch(setProfessionalOpen({ slug, open: (open })) => !open)}'
new = 'onClick={() => dispatch(setProfessionalOpen({ slug, open: !isProfessionalSectionOpen }))}'
content = content.replace(old, new, 1)

# Also check for any similar pattern with setServiceOpen toggle
old2 = 'dispatch(setServiceOpen({ slug, open: (open })) => !open)'
if old2 in content:
    new2 = 'dispatch(setServiceOpen({ slug, open: !isServiceSectionOpen }))'
    content = content.replace(old2, new2)

with open(path, 'w') as f:
    f.write(content)

print('OK - toggle dispatches fixed')
