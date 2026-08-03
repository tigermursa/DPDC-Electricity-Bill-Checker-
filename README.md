# Project Discussion

This project is built to help users monitor their DPDC electricity bills automatically.

## Features

- Users can check their current DPDC electricity bill.
- Every checked bill is stored in the database as history.
- A scheduled cron job periodically checks for bill updates.
- If the bill amount changes, the system automatically sends a notification to a Discord channel with the latest balance.
- Prevents users from manually checking their bills repeatedly by providing automatic monitoring.

## Workflow

1. A user checks their DPDC electricity bill.
2. The bill information is saved for future comparison.
3. A cron job runs at scheduled intervals.
4. The latest bill is fetched from DPDC.
5. The new bill is compared with the previously stored bill.
6. If the balance has changed, a Discord notification is sent with the updated balance.
7. If there is no change, no notification is sent.

## Purpose

The main goal of this project is to automate electricity bill monitoring and provide instant notifications whenever a bill is updated, making it easier for users to stay informed without checking manually.
