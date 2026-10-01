## Task ID: SlotSync

#### `Full Stack Web Development`, `Databases`, `Authentication & Authorization`, `RBAC`

Mentors: [Aditi Pandey](https://github.com/aditip149209) ([+91 9686975890](https://wa.me/919686975890)), [Abhimanyu Kapoor](https://github.com/AbhimanyuKapoor) ([+91 9359359510](https://wa.me/919359359510))

Difficulty: `Medium / Hard`

### Description

Booking a classroom, seminar hall, or lab at NITK still means paper registers, running around for signatures, and double-bookings nobody notices until the day. Build **SlotSync**, a Campus Infrastructure Booking Module where authorised users can see live availability, request a room in a few clicks, and get instant updates. Admins get role-based control to approve, reject, and track everything in one place.

**Submission is different from the rest of this document.** Create a **private** GitHub repository named `SlotSync_<Roll-No>` (e.g. `SlotSync_251CS236`), add `aditip149209`, `nilansgit`, and `AbhimanyuKapoor` as collaborators. Use **MVC architecture** and a **relational database** (e.g. MySQL, SQLite). Frontend frameworks (Bootstrap, Vue, React, etc.) are optional. Implementing every feature is recommended but not required — individual features carry their own points.

**Roles**

1. **Admin / Facility Manager** - add/update rooms, approve/reject requests, view usage.
2. **Faculty** - browse facilities, request bookings, cancel, track status, get notifications.
3. **Convenor** - same permissions as Faculty.
4. **Student** - browse facilities and view availability only. Cannot book.

Authentication is mandatory. Unauthenticated users cannot access any page except login/register. Only faculty and convenors can create booking requests. By default roles are fixed; making them configurable is a bonus task.

**Suggested schema** (attributes are a starting point, not a fixed table list — design your own where it makes sense):

- **User:** name, email, branch/department, password, role.
- **Facility:** name, category/type, capacity, operating hours, availability/status.
- **Booking:** user, facility, date, time slot, status, rejection/cancellation reason.

### Features to Implement

1. **Facility Management**

   - Admin can add, edit, and remove facilities.
   - Set type, location, capacity, and operating hours.
   - Update status: available / unavailable / under maintenance.
   - Facilities under maintenance or outside operating hours cannot be booked.

2. **Facility Booking - Faculty/Convenor**

   - View real-time availability per facility and date (slot grid).
   - Filter facilities by type and capacity.
   - Request a 1 hour slot within the facility's operating hours.
   - Limit: 1 slot per day per user.
   - Track status: pending, approved, rejected, cancelled.
   - Request cancellation (needs admin approval).
   - Notifications: approval/rejection updates, plus a reminder 30 minutes before the slot.

3. **Facility Booking - Regular Student**

   - View facilities and availability (read only). The booking action is hidden **and** blocked at the API.

4. **Facility Booking - Admin**

   - Approve or reject requests (a reason is required for rejection).
   - Approve or reject cancellation requests.
   - Two approved bookings must never overlap on the same facility and slot.

### Bonus Features (Optional)

*Tasks in this section can be attempted in any order. It is not compulsory to complete all of them, but implement as many as possible for better chances of an interview.*

1. **Configurable RBAC**

   - Admin can create, edit, and delete roles from the UI (no code changes).
   - Each role gets a set of permissions, e.g. `view_facilities`, `book_facility`, `cancel_booking`, `approve_booking`, `manage_facilities`, `view_analytics`, `manage_roles`.
   - Admin can assign or change a user's role.
   - Permission checks happen on every backend route, driven by the database (not hardcoded role names).
   - Changes take effect immediately, and the default roles (Admin, Faculty, Convenor, Student) are seeded with sensible permissions.

2. **Waitlist and Penalty System**

   - No-shows without cancelling get a 24 hour booking restriction.
   - Users can join a waitlist for a given slot. On cancellation, the first in line is promoted automatically and notified immediately.

3. **Analytics Dashboard** for admins, showing:

   - Most booked facilities.
   - Peak hours.
   - Usage trends over time (daily/weekly/monthly).
   - Other insightful statistics.

4. Polish the UI/UX of the module and the overall flow, and set up mailers for notifications.

### Tips

- Nail down the booking lifecycle (pending → approved/rejected → cancelled) and the overlap-prevention logic before layering on the bonus features.
- Enforce role checks on the backend routes, not just by hiding UI elements — a student hitting the booking API directly must still be blocked.
- Add a README with a demo video, setup-from-scratch instructions, steps to run the project, implemented/non-implemented features, known bugs, references, and screenshots.
- Good programming practices — modular code, documentation, following your framework's conventions — are recommended and improve your chances of an interview.

### Useful Resources

- [Hybrid Schemas](https://www.stratoscale.com/blog/dbaas/hybrid-databases-combining-relational-nosql/)
- Authentication: [Devise (Rails)](https://guides.railsgirls.com/devise), [Django Auth](https://docs.djangoproject.com/en/4.0/topics/auth/), [Passport.js (Express)](https://www.passportjs.org/)
- File Uploads: [Active Storage (Rails)](https://edgeguides.rubyonrails.org/active_storage_overview.html), [Django File Uploads](https://docs.djangoproject.com/en/4.0/topics/http/file-uploads/), [Multer (Express)](http://expressjs.com/en/resources/middleware/multer.html)
- Mailers: [express-mailer](https://www.npmjs.com/package/express-mailer)