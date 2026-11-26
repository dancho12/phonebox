# Home Assistant dashboard widget

The **Home Assistant dashboard** widget shows a Home Assistant dashboard as it is, with its own cards, on the panel.
The phone opens the dashboard itself, from your Home Assistant server. (The **Home Assistant** widget is the other way
round: the agent reads chosen entities with your token and the panel draws them its own way.)

## Setup in four steps

1. **PhoneBox:** in **Settings › General › Home Assistant**, enter the address and a long-lived access token
   (Home Assistant: your profile › **Security** › **Long-lived access tokens**). The phone signs in with this token, so
   there is no password to type on the phone and no trusted network to set up.
2. **Home Assistant, two add-ons** from **Settings › Marketplace** (HACS on Home Assistant 2026.10 and older):
   - [PhoneBox embed](https://github.com/dancho12/ha-phonebox-embed) fits a dashboard to the panel: a 12 × 6 grid, no
     background, no padding. It works with any theme and changes nothing outside the panel.
   - [kiosk-mode](https://github.com/NemesisRE/kiosk-mode) hides the header and the sidebar. The widget asks for that
     itself (`?kiosk` in the address), so on the computer the dashboard keeps them.
3. **Home Assistant, one setting:** add this to `configuration.yaml` and restart Home Assistant. Without it Home
   Assistant refuses to be shown inside another app, and the widget stays empty.
   ```yaml
   http:
     use_x_frame_options: false
   ```
4. **A dashboard for the panel:** in Home Assistant, a new dashboard, view type **Sections**, the view's
   **Max number of section columns** at **1**, and one section with your cards. In its raw configuration add
   ```yaml
   phonebox:
     columns: 12
     rows: 6
   ```
   A card's size (**Layout** in its settings) is then in panel cells: 6 × 2 is half the width and a third of the
   height. The PhoneBox embed README has more, with pictures.

Then add the **Home Assistant dashboard** widget to a page and pick the dashboard in its settings.

## The widget's settings

- **Dashboard and view**: the dashboards and views Home Assistant lists, or **Another path…** for any
  `dashboard/view`, for example `lovelace/0`. Under the list, **The phone opens** shows the exact address.
- **Sign-in**: **With the token from Settings › General** (the default), or **Home Assistant's own sign-in** for a
  phone that should be a user of its own: then the phone shows Home Assistant's sign-in page once (or a trusted network
  lets it in).
- **Hide Home Assistant's header and sidebar** (on by default; needs kiosk-mode).
- **Home Assistant address for the phone**: only when the phone reaches Home Assistant at another address than the
  computer. With a `.local` name such as `homeassistant.local`, the phone tries the name first and then the IP
  addresses it has on the computer, and uses the first that answers. `localhost` is not the server for the phone:
  enter the computer's address on the network, for example `http://192.168.1.10:8123`.
- **No card background** (on by default): the dashboard's own cards are the widget.

Until the server answers, the widget says so and tries again every 15 seconds. When the server answers again after
an outage, the dashboard is reloaded.

## How the sign-in works

Home Assistant's own app signs its pages in by handing Home Assistant a token ("external auth"): Home Assistant's
frontend asks the app for one instead of showing its sign-in page. PhoneBox does the same. The agent gives the token
from Settings only to a Home Assistant dashboard widget of that phone, never in the phone's configuration, and the app
hands it only to pages of your Home Assistant server's addresses, and only inside the panel. The dashboard then runs as
the token's user: with an administrator's token, kiosk-mode hides the menus, but the user is still an administrator.
For a panel that others can reach, make a Home Assistant user without administrator rights and choose
**Home Assistant's own sign-in**.

## Plain http

Home Assistant on a home network is often plain `http`. The panel allows that: it is served over `http` inside the
app (it never goes to the network), so the dashboard and its pictures are not blocked as mixed content.
