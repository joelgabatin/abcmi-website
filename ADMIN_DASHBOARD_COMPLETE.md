# Admin Dashboard - Complete Setup & Real-Time Updates

## Overview
The admin dashboard and all admin nav items are now fully functional with real-time database updates. When members/visitors submit data from the public site, it immediately appears in the admin dashboard.

## Admin Dashboard Features

### 1. Real-Time Data Display
All key admin pages now have real-time Supabase subscriptions:

#### Prayer Requests (`/admin/prayers`)
- **Real-Time Updates**: Automatically refreshes when new prayer requests are submitted
- **Status Management**: Change status from Pending → Praying → Answered
- **Admin Notes**: Add internal notes for follow-up
- **Search & Filter**: Search by name/request, filter by status
- **Stats**: Total, Pending, Praying, and Answered counts

#### Donations (`/admin/donations`)
- **Real-Time Updates**: Shows new donations as they're submitted
- **Donor Info**: View donor name, amount, and date
- **Payment Methods**: Track payment method used (GCash, BPI, Bank Transfer)
- **Filter by Type**: Filter donations by category
- **Total Tracking**: View total donation amounts

#### Counseling Requests (`/admin/counseling`)
- **Real-Time Updates**: Shows new counseling requests instantly
- **Status Tracking**: Pending, In Progress, Completed
- **Preferred Date/Time**: View member's availability preferences
- **Assignment**: Assign counselor and add notes
- **Topic**: Track counseling topic

#### Members (`/admin/members`)
- **Real-Time Updates**: New registrations appear instantly
- **Profile Management**: Edit member details
- **Role Assignment**: Set member roles (admin, member, counselor)
- **Status Tracking**: Active/Inactive members
- **Search Function**: Find members by name or email

#### Events (`/admin/events`)
- **Real-Time Updates**: New events appear instantly
- **Full CRUD**: Create, read, update, delete events
- **Date/Time Management**: Set event dates and times
- **Recurring Events**: Option to create recurring events
- **Featured Events**: Mark events as featured
- **Direct Website Display**: Events automatically display on member dashboard and public event page

### 2. Admin Dashboard Home Page
The main admin dashboard shows:
- **Key Metrics**: Total members, prayer requests, pending prayers, upcoming events, total donations
- **Recent Activity Feed**: 
  - New prayer requests
  - New counseling requests
  - Donations received
  - New member registrations
  - Event updates
- **Live Update Badge**: Visual indicator when data updates in real-time
- **Quick Actions**: Links to all admin management pages

### 3. Content Management (`/admin/content`)
Manage website-wide content:
- **Church Information**: Name, tagline, description
- **Contact Details**: Email, phone, address, service times
- **Social Links**: Facebook, YouTube, Instagram, Twitter
- **Hero Section**: Title, subtitle, description, images
- **Mission/Vision**: Mission statement, vision statement, core values
- **About Section**: Short description and founding year

## Real-Time Subscription Architecture

All admin pages implement debounced real-time subscriptions:

```typescript
useEffect(() => {
  fetchData()

  // Debounce timer prevents excessive database queries
  let updateTimeout: NodeJS.Timeout
  const debouncedFetch = () => {
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(() => {
      fetchData()
    }, 500)
  }

  const subscription = supabase
    .channel('table_name_channel')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'table_name' }, 
      debouncedFetch
    )
    .subscribe()

  return () => {
    clearTimeout(updateTimeout)
    subscription.unsubscribe()
  }
}, [])
```

This ensures:
- Changes are detected within 500ms
- Excessive queries are prevented through debouncing
- Subscriptions are properly cleaned up
- No performance degradation

## Data Flow: From Member Action to Admin Dashboard

### Prayer Request Flow
1. Member submits prayer request at `/prayer-request`
2. Data inserted into `prayer_requests` table
3. Admin dashboard subscription detects change
4. Admin prayers page (`/admin/prayers`) updates automatically
5. Admin dashboard activity feed shows "New prayer request"

### Donation Flow
1. Member submits donation at `/donate`
2. Data inserted into `donations` table
3. Admin dashboard and donations page subscriptions detect change
4. Admin donations page (`/admin/donations`) updates automatically
5. Admin dashboard shows donation amount and donor info

### Counseling Request Flow
1. Member submits counseling request at `/counseling`
2. Data inserted into `counseling_requests` table
3. Admin dashboard subscription detects change
4. Admin counseling page (`/admin/counseling`) updates automatically
5. Admin can assign counselor and add notes

### New Member Registration Flow
1. New user registers in the system
2. Profile created in `profiles` table
3. Admin members page subscription detects change
4. Admin members page (`/admin/members`) updates automatically
5. Shows new registration in activity feed

### Event Creation Flow
1. Admin creates event at `/admin/events`
2. Event inserted into `events` table
3. Member dashboard and events pages subscribe to changes
4. Events appear on `/events` page automatically
5. Events appear on member dashboard

## Database Tables Used

| Table | Real-Time | Admin Page | Source |
|-------|-----------|-----------|--------|
| prayer_requests | ✓ | /admin/prayers | Member submission |
| donations | ✓ | /admin/donations | Member submission |
| counseling_requests | ✓ | /admin/counseling | Member submission |
| profiles | ✓ | /admin/members | User registration |
| events | ✓ | /admin/events | Admin creation |
| site_settings | ✓ | /admin/content | Admin management |
| announcements | - | - | Planned |
| daily_verses | ✓ | - | Admin creation |
| ministries | - | - | Planned |
| testimonies | - | - | Planned |

## Testing Real-Time Updates

To test the real-time functionality:

1. **Prayer Requests**:
   - Go to `/prayer-request` and submit a prayer
   - Watch `/admin/prayers` update in real-time
   - Check admin dashboard activity feed

2. **Donations**:
   - Go to `/donate` and submit a donation
   - Watch `/admin/donations` update in real-time
   - Check total donations on dashboard

3. **Counseling**:
   - Go to `/counseling` and submit a counseling request
   - Watch `/admin/counseling` update in real-time
   - Admin can assign and add notes

4. **Members**:
   - Create a new member account
   - Watch `/admin/members` update in real-time
   - New member appears in activity feed

5. **Events**:
   - Go to `/admin/events` and create an event
   - Watch `/events` page update automatically
   - Event appears on member dashboard

## Performance Optimizations

✓ **Debounced Subscriptions**: 500ms debounce prevents rapid consecutive updates
✓ **Silent Error Handling**: Errors don't spam the console
✓ **Selective Queries**: Only fetch necessary columns
✓ **Connection Pooling**: Supabase manages connection efficiency
✓ **Cleanup**: All subscriptions properly unsubscribe on component unmount

## Admin Navigation Items - All Functional

- ✓ Dashboard (`/admin`) - Real-time stats and activity
- ✓ Members (`/admin/members`) - Full CRUD, real-time
- ✓ Prayer Requests (`/admin/prayers`) - Full management, real-time
- ✓ Events (`/admin/events`) - Full CRUD, real-time
- ✓ Counseling (`/admin/counseling`) - Full management, real-time
- ✓ Donations (`/admin/donations`) - View donations, real-time
- ✓ Content (`/admin/content`) - Edit site settings
- ✓ Reports (`/admin/reports`) - View analytics

## Notes

- All real-time subscriptions use debouncing to prevent database overload
- Error messages are user-friendly (no verbose console logs)
- Data is securely managed through Supabase RLS policies
- Admin dashboard automatically shows recent activity from all tables
