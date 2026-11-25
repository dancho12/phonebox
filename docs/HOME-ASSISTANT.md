# Home Assistant dashboard widget

The **Home Assistant dashboard** widget shows a Home Assistant dashboard as it is, with its own cards, on the panel.
The phone opens the dashboard itself, from your Home Assistant server, and Home Assistant signs it in as one of its
users. (The **Home Assistant** widget is the other way round: the agent reads chosen entities with your token and the
panel draws them its own way.)

## What it needs

1. **The address**, in **Settings › General › Home Assistant**. With the token there too, the widget's settings list
   your dashboards and views to pick from. The token stays on the computer: the phone gets only the address, and only
   while one of its pages has this widget.
2. **A Home Assistant user for the phone**, best one without administrator rights. The phone either signs in once in
   the widget (Home Assistant remembers it) or is trusted by its address (`trusted_networks` with
   `allow_bypass_login`), so it never sees a sign-in page.
3. **Home Assistant allowed in a frame**: `use_x_frame_options: false` under `http:` in `configuration.yaml`. By
   default Home Assistant refuses to be shown inside another app, and the widget stays empty.

## The widget's settings

- **Dashboard and view**: pick one from the list Home Assistant gives (it needs the token), or **Another path…** for
  any `dashboard/view`, for example `lovelace/0`. Under the list, **The phone opens** shows the exact address.
- **Home Assistant address for the phone**: only when the phone reaches Home Assistant at another address than the
  computer. A `.local` name such as `homeassistant.local`, which Android often cannot find, is already sent as the IP
  address it has on the computer. `localhost` is not the server for the phone, though: enter the computer's address
  on the network, for example `http://192.168.1.10:8123`.
- **No card background** (on by default): the dashboard's own cards are the widget.

Until the server answers, the widget says so and tries again every 15 seconds. When the server answers again after
an outage, the dashboard is reloaded.

## Making a dashboard fit the panel

A dashboard made for a computer screen has its own background and padding, and its grid does not match the panel's.
Two community add-ons make it fit:

- [PhoneBox embed](https://github.com/dancho12/ha-phonebox-embed): a dashboard module. It lays the cards out on the
  panel's 12 × 6 grid (6 × 2 is half the width and a third of the height, in the editor on the computer too), makes
  the page transparent so the panel's background shows through, and drops the outer padding. It works with any theme
  and changes the dashboard only inside the panel.
- [kiosk-mode](https://github.com/NemesisRE/kiosk-mode): hides Home Assistant's header and sidebar for the phone's
  user only.

The PhoneBox embed README has the whole setup step by step, in English and Russian.

## Plain http

Home Assistant on a home network is often plain `http`. The panel allows that: it is served over `http` inside the
app (it never goes to the network), so the dashboard and its pictures are not blocked as mixed content.
