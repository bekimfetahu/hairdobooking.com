import re

path = '/home/bekim/projects/hairdobooking.com/src/app/salon/[slug]/page.js'

with open(path, 'r') as f:
    content = f.read()

# ── 1. Add Redux imports after the react-select import ──
old_imports = 'import Select from "react-select";'
new_imports = '''import Select from "react-select";
import { useSelector, useDispatch } from "react-redux";
import {
  initBooking,
  selectBooking,
  setSelectedDate as setDate,
  setSelectedServiceUuid as setService,
  setSelectedCategoryUuid as setCategory,
  setSelectedAudienceUuid as setAudience,
  setServiceSearch as setSearch,
  setIsServiceSectionOpen as setServiceOpen,
  setIsProfessionalSectionOpen as setProfessionalOpen,
} from "@/store/slices/bookingSlice";'''
content = content.replace(old_imports, new_imports, 1)

# ── 2. Add dispatch + selector after useParams ──
old_slug = '''  const { slug } = useParams();
  const [loading, setLoading] = useState(true);'''
new_slug = '''  const { slug } = useParams();
  const dispatch = useDispatch();
  const booking = useSelector(selectBooking(slug));

  // Initialize booking state for this slug on first render
  useEffect(() => {
    if (slug) dispatch(initBooking({ slug }));
  }, [slug, dispatch]);

  const [loading, setLoading] = useState(true);'''
content = content.replace(old_slug, new_slug, 1)

# ── 3. Remove the useState declarations for booking fields ──
# Remove selectedDate useState block (multi-line)
content = re.sub(
    r'  const \[selectedDate, setSelectedDate\] = useState\(\(\) => \{[^}]+\}[^;]+;\s*',
    '',
    content,
    count=1
)

# Remove simple useState lines for booking fields
for var_name in [
    'selectedServiceUuid',
    'serviceSearch',
    'isServiceSectionOpen',
    'isProfessionalSectionOpen',
    'selectedCategoryUuid',
    'selectedAudienceUuid',
]:
    content = re.sub(
        rf'  const \[{var_name}, set{var_name[0].upper() + var_name[1:]}\] = useState\([^)]*\);\s*\n',
        '',
        content,
        count=1
    )

# ── 4. Destructure booking fields from the selector ──
# Add destructuring after the booking selector line
old_booking_line = '  const booking = useSelector(selectBooking(slug));'
new_booking_line = '''  const booking = useSelector(selectBooking(slug));
  const {
    selectedDate,
    selectedServiceUuid,
    selectedCategoryUuid,
    selectedAudienceUuid,
    serviceSearch,
    isServiceSectionOpen,
    isProfessionalSectionOpen,
  } = booking;'''
content = content.replace(old_booking_line, new_booking_line, 1)

# ── 5. Replace setter calls with dispatch calls ──
# setSelectedDate(value) -> dispatch(setDate({ slug, date: value }))
content = re.sub(
    r'onChange=\{setSelectedDate\}',
    r'onChange={(val) => dispatch(setDate({ slug, date: val }))}',
    content
)

# setServiceSearch(e.target.value)
content = re.sub(
    r'onChange=\{\(e\) => setServiceSearch\(e\.target\.value\)\}',
    r'onChange={(e) => dispatch(setSearch({ slug, query: e.target.value }))}',
    content
)

# setSelectedCategoryUuid(opt ? opt.value : "")
content = re.sub(
    r'onChange=\{\(opt\) => setSelectedCategoryUuid\(opt \? opt\.value : ""\)\}',
    r'onChange={(opt) => dispatch(setCategory({ slug, uuid: opt ? opt.value : "" }))}',
    content
)

# setSelectedAudienceUuid(opt ? opt.value : "")
content = re.sub(
    r'onChange=\{\(opt\) => setSelectedAudienceUuid\(opt \? opt\.value : ""\)\}',
    r'onChange={(opt) => dispatch(setAudience({ slug, uuid: opt ? opt.value : "" }))}',
    content
)

# setSelectedServiceUuid(service.uuid)
content = re.sub(
    r'setSelectedServiceUuid\(service\.uuid\)',
    r'dispatch(setService({ slug, uuid: service.uuid }))',
    content
)

# setIsServiceSectionOpen(true/false/value)
content = re.sub(
    r'setIsServiceSectionOpen\(([^)]+)\)',
    r'dispatch(setServiceOpen({ slug, open: \1 }))',
    content
)

# setIsProfessionalSectionOpen(true/false/value)
content = re.sub(
    r'setIsProfessionalSectionOpen\(([^)]+)\)',
    r'dispatch(setProfessionalOpen({ slug, open: \1 }))',
    content
)

with open(path, 'w') as f:
    f.write(content)

print('OK - salon page wired to Redux booking slice')
