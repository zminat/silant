# Silant

This project is a Django-based Telegram chatbot for determining a user's "totem animal" using a quiz. It includes a web interface (via Django admin) for editing quiz questions and downloading log files, and a Telegram bot for interacting with users.

## Requirements

- Python 3.9+
- Other dependencies as listed in `requirements.txt`

## Installation

1. **Install Required Packages**

   Run the following command to install all dependencies from requirements.txt:
```bash
   pip install -r requirements.txt
```

## Running the Project

- **Django Server**

  To run the Django server (for editing questions and downloading logs via the Django admin), execute:
```bash
  python manage.py runserver
```


## Table Interaction Guide

1. **Navigation**: Different rows contain cells with links to detailed information about machines or other parts.

2. **Horizontal Scrolling**: Use Shift + mouse wheel to scroll horizontally in tables.

3. **Sorting**: Click on a column header to sort data by that column.

4. **Filtering**: Use the filter icon in table headers to filter data.

5. **Cell Editing**: Double-click on a cell to edit its content.

6. **Adding Data**: Fill in all cells in the empty row at the bottom of the grid to add new records.

7. **Deleting Records**: Select rows (use Shift or Ctrl keys for multiple selection) and press Shift+Delete to remove them.