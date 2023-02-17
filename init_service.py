#!/usr/bin/env python3

import os

DEFAULT_LOCATION = "/etc/systemd/system/YTMusic.service"

print("Make sure you run start.sh to build the binaries!")
print("This tool will create a service file for you.")

location = input(f"Service Location (ENTER for default {DEFAULT_LOCATION}): ") or DEFAULT_LOCATION

username = input("Username: ")
if not username:
  print("Provide a username!")
  quit()

with open("YTMusic.service", "r") as file:
    service = file.read()
    with open(location, "w") as newfile:
      newfile.write(service.replace("$USER", username).replace("$CWD", os.path.join(os.getcwd(), "out")))

print(f"Wrote service file to {location}.")
print("Enabling service...")
os.system("systemctl enable YTMusic.service")
print("Starting...")
os.system("systemctl start YTMusic.service")
print("Done!")
