---
title: Database
status: To Do
description: Create your first database and explore all the attached features. Click to learn more.
priority: Low
_emoji: ❤️
---

# Database

:::toc "Table of Contents"
:::

Databases are nothing but organised folders. All files in the folder have YAML headers which help distinguish them as individual rows. Hillnote databases can take multiple forms and theres are called views.  
![Pasted image](resources/images/Database/1782818069497.webp)

## Creating a database

To create a database simply click ‘+’ in the sidebar and under organised folders choose a template. Tables is the base for all other templates.  
![Pasted image](resources/images/Database/1782805868642.webp)

## Columns

Once you create a database the next step is defining the columns you’d like to have and track across your rows. Click on the ⚙️(gear) icon in the top right. This opens the edit columns dialog to set your columns.  
![Pasted image](resources/images/Database/1782818381946.webp)You can reorder the columns by using the arrow buttons next to the title or add a new column by clicking the “+ Add Column” button.

![Pasted image](resources/images/Database/1782818528499.webp)Every column consists of 3 values.  
**Name**: A name or unique value to track  
**Type**: The input type  
**Default value**: An optional default to use when creating new rows

### Types of columns

There are 13 types of columns currently.

1. Text
2. number
3. Select
4. Multi-select
5. Date
6. Date and Time
7. Checkbox
8. URL
9. Email
10. Person
11. Recurring
12. Status (only 1 allowed per database)
13. Recurring (Only present when a status column is already added to the database)

![Pasted image](resources/images/Database/1782818675980.webp)

### Special column settings

Some columns types have additional settings to help manage nuances in how they are tracked.

**==Status==**  
As you add status options you could assign values to them (namely normal, done and archive)

1. **Normal**: these are treated like every other selection item
2. **Done**: Tasks in this column are treated as completed. This helps in tracking end dates, reminders, etc.
3. **Archive:** Tasks here are usually collapsed, given less emphasis, etc.

![Pasted image](resources/images/Database/1782819157646.webp)**==Date==**  
Dates once added can be marked as start and end dates to track against tasks, on calendars, etc. Only one column per database can carry these values.

**![Pasted image](resources/images/Database/1782819364210.webp)**

**==Recurring==**  
If a database contains a status column you can also add a recurring column. this allows you to setup recurring tasks which reset to the selected column on a specific interval. This option is set per row item.  
**![Pasted image](resources/images/Database/1782819481158.webp)**

## Views

Views allow you to perceive and organise your data differently. Hillnote currently supports the following types of views.

### Table view

![Pasted image](resources/images/Database/1782819840966.webp)

### Kanban Boards

![Pasted image](resources/images/Database/1782819862129.webp)

### Calendar views

![Pasted image](resources/images/Database/1782819868460.webp)

### Gallery

![Pasted image](resources/images/Database/1782820067824.webp)

### Charts

![Pasted image](resources/images/Database/1782820163472.webp)

### Filters in views

Views can show filtered versions of all rows. Simply add a filter by clicking on the filters icon and set the filter rules to apply the same. Filters are saved to the view and remain isolated to the same.  
![Pasted image](resources/images/Database/1782820358504.webp)

## Adding a row

Adding a row is as easy as clicking the “+ New Row” button in the top right of the database. Fill in the values and you are done!  
![Pasted image](resources/images/Database/1782820604276.webp)

## ==Some quick tips==

### Embedding a database within a document

You can embed a database in a [[Pages|doc:documents/Exploring%20Hillnote/Pages.md]] by typing ‘@’ and referencing the database. This adds an interactive embed within the document.

### Using triggers to trigger new workflows from your database

You can setup triggers within the database to fire workflows on the server (Claude routines, Hillnote routines, etc) based on database actions.

