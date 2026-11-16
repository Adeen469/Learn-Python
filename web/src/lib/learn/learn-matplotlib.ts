import type { LearnTutorial } from "./types";

export const TUTORIALS: LearnTutorial[] = [
  {
    slug: "matplotlib-intro",
    title: "Matplotlib Intro",
    intro: "Matplotlib is the most used Python library for drawing charts. It turns lists of numbers into line charts, bar charts, scatter plots, and more.",
    blocks: [
      { type: "heading", text: "What is Matplotlib?" },
      { type: "para", text: "Matplotlib draws charts from your data. You give it lists of numbers, and it draws the picture. A chart made with Matplotlib is called a figure, and inside a figure you draw one or more plots, each with data points, axes, and optional labels, a title, and a legend. It works with plain Python lists and with NumPy arrays, and it is often used together with NumPy and pandas: NumPy supplies the numbers, pandas supplies the table, and Matplotlib draws the picture." },
      { type: "heading", text: "Check that Matplotlib is installed" },
      { type: "para", text: "The first step is to check the installed version. Import the library and print its version number." },
      {
        type: "code",
        title: "Check the version",
        code: `import matplotlib
matplotlib.use("Agg")
print(matplotlib.__version__)`,
        output: "3.6.3",
      },
      { type: "para", text: "The line matplotlib.use(\"Agg\") picks a backend that draws charts without opening a window. Use it at the top of every script that runs without a screen, for example on a server or in an online editor." },
      { type: "heading", text: "Your first chart" },
      { type: "para", text: "The next example plots the numbers 1, 4, 9, and 16 against 1, 2, 3, and 4. The result is a line that rises steeply, because the y values grow faster than the x values. The chart is saved to a file instead of shown on screen." },
      {
        type: "code",
        title: "Plot four points",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

x = [1, 2, 3, 4]
y = [1, 4, 9, 16]
plt.plot(x, y)
plt.savefig("/tmp/mpl_intro.png")
print("Saved chart with 4 points")`,
        output: "Saved chart with 4 points",
      },
      { type: "para", text: "The plt.plot() call draws the line, and plt.savefig() writes the chart to a PNG file. Open the file to see the chart: a single rising line with points at (1, 1), (2, 4), (3, 9), and (4, 16)." },
    ],
    practice: [
      "Print the Matplotlib version installed on your machine.",
      "Plot the points x = [0, 1, 2, 3] and y = [0, 2, 4, 6] and save the chart to a file.",
      "Change the y values to [0, 1, 8, 27] and describe how the shape of the line changes.",
    ],
    summary: [
      "Matplotlib turns lists of numbers into charts.",
      "matplotlib.use(\"Agg\") lets charts run without a screen.",
      "plt.plot(x, y) draws a line chart from two lists.",
      "plt.savefig() writes the chart to an image file.",
    ],
  },
  {
    slug: "matplotlib-getting-started",
    title: "Matplotlib Get Started",
    intro: "This tutorial shows how to install Matplotlib and run your first chart. If Matplotlib is already installed, you can skip straight to the example.",
    blocks: [
      { type: "heading", text: "Install Matplotlib" },
      { type: "para", text: "Install Matplotlib with pip, the Python package installer. Run this command in your terminal. You only need to do it once. If you use Anaconda, Matplotlib is usually already installed. If not, run conda install matplotlib in the Anaconda terminal instead. The exact version numbers in the output depend on when you install it; the last line is the one that matters." },
      {
        type: "code",
        code: "pip install matplotlib",
        title: "Install with pip",
        output: `Successfully installed contourpy-1.4.0 cycler-0.12.1 fonttools-4.68.0 kiwisolver-1.5.1 matplotlib-3.11.2 numpy-2.5.5 packaging-26.3 pillow-13.0.0 pyparsing-3.3.3 python-dateutil-4.0.0 tzdata-2026.6`,
      },
      { type: "heading", text: "Check the install" },
      { type: "para", text: "After installing, check that Python can import the library and print its version. If this runs without an error, the install worked." },
      {
        type: "code",
        title: "Verify the install",
        code: `import matplotlib
matplotlib.use("Agg")
print(matplotlib.__version__)
print("Matplotlib is ready to use")`,
        output: "3.6.3\nMatplotlib is ready to use",
      },
      { type: "heading", text: "Draw your first chart" },
      { type: "para", text: "Most Matplotlib work starts with importing matplotlib.pyplot, usually shortened to plt. The example below plots y = x squared for x values 0 to 3, so the line curves upward. It saves the chart to a file and prints the data it plotted." },
      {
        type: "code",
        title: "First line chart",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

x = [0, 1, 2, 3]
y = [0, 1, 4, 9]
plt.plot(x, y)
plt.savefig("/tmp/mpl_start.png")
print(x)
print(y)`,
        output: "[0, 1, 2, 3]\n[0, 1, 4, 9]",
      },
      { type: "tip", text: "Three functions do most of the work in every Matplotlib script: plt.plot() draws the data, plt.savefig() or plt.show() displays it, and plt.close() frees the figure when you are done. Use plt.show() when you run code on your own computer with a screen, and plt.savefig() when you run code on a server or in an online editor without a screen." },
    ],
    practice: [
      "Run pip install matplotlib in your terminal, then print the version to confirm it worked.",
      "Plot x = [0, 1, 2, 3, 4] and y = [0, 3, 6, 9, 12] and save the chart.",
      "Try plt.show() instead of plt.savefig() and see what happens on your machine.",
    ],
    summary: [
      "Install Matplotlib with pip install matplotlib.",
      "Import it as matplotlib.pyplot, usually shortened to plt.",
      "plt.plot(x, y) draws the chart from two lists.",
      "plt.savefig() saves the chart; plt.show() displays it on screen.",
    ],
  },
  {
    slug: "matplotlib-pyplot",
    title: "Matplotlib Pyplot",
    intro: "Pyplot is the part of Matplotlib you use most. It gives you simple functions like plot(), title(), and show() that build a chart step by step.",
    blocks: [
      { type: "heading", text: "What is pyplot?" },
      { type: "para", text: "Pyplot is a collection of functions that make Matplotlib easy to use. Each function changes the current figure: plot() adds a line, title() adds a title, xlabel() labels an axis. You call them one after another, and the chart grows. The usual import is import matplotlib.pyplot as plt, a convention used in almost all Matplotlib examples, so keep it." },
      { type: "heading", text: "Plot a line" },
      { type: "para", text: "The plot() function takes x values and y values and draws a line through the points. This example plots three points on a straight diagonal line and then reads the data back from the line object." },
      {
        type: "code",
        title: "Plot with pyplot",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

line, = plt.plot([1, 2, 3], [1, 2, 3])
print(list(line.get_xdata()))
print(list(line.get_ydata()))`,
        output: "[1, 2, 3]\n[1, 2, 3]",
      },
      { type: "para", text: "The line object returned by plot() stores the data you plotted. The get_xdata() and get_ydata() methods read that data back, which is handy when you want to check what a chart contains." },
      { type: "heading", text: "Add a title" },
      { type: "para", text: "A chart without a title is hard to read. The title() function adds a heading above the chart. This example plots four sales numbers and titles the chart Sales in January." },
      {
        type: "code",
        title: "Add a chart title",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4], [10, 20, 25, 30])
plt.title("Sales in January")
print(plt.gca().get_title())`,
        output: "Sales in January",
      },
      { type: "note", text: "The gca() function means get current axes. It returns the plot you are working on, so get_title() reads the title you just set. Pyplot keeps track of the current figure and the current axes for you, which is why you can call plt.plot() and plt.title() without naming a figure." },
    ],
    practice: [
      "Plot the points (0, 0), (1, 5), (2, 10) and give the chart a title.",
      "Plot two lines on the same chart by calling plt.plot() twice before saving.",
      "Read the title back with plt.gca().get_title() and print it.",
    ],
    summary: [
      "Pyplot is the simple function interface to Matplotlib.",
      "Import it as import matplotlib.pyplot as plt.",
      "plt.plot(x, y) draws a line through the given points.",
      "plt.title() adds a heading above the chart.",
    ],
  },
  {
    slug: "matplotlib-plotting",
    title: "Matplotlib Plotting",
    intro: "Plotting means drawing data as a chart. This tutorial covers the basics: plotting x and y values, and what happens when you give only y values.",
    blocks: [
      { type: "heading", text: "Plot x against y" },
      { type: "para", text: "The plot() function takes two lists: xpoints for the horizontal axis and ypoints for the vertical axis. It draws a line through each pair of values, in order." },
      {
        type: "code",
        title: "Plot x and y",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

xpoints = [1, 2, 6, 8]
ypoints = [3, 8, 1, 10]
plt.plot(xpoints, ypoints)
plt.savefig("/tmp/mpl_plot.png")
print(xpoints)
print(ypoints)`,
        output: "[1, 2, 6, 8]\n[3, 8, 1, 10]",
      },
      { type: "para", text: "The line connects the points (1, 3), (2, 8), (6, 1), and (8, 10). It goes up, then drops sharply, then rises again. The shape of the line tells the story of the data at a glance." },
      { type: "heading", text: "Plot only y values" },
      { type: "para", text: "If you pass only one list, Matplotlib uses it as the y values and uses 0, 1, 2, 3, and so on as the x values. This is useful when your data is just a sequence of measurements in order." },
      {
        type: "code",
        title: "Plot y values only",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

line, = plt.plot([3, 8, 1, 10])
print(list(line.get_xdata()))
print(list(line.get_ydata()))`,
        output: "[0.0, 1.0, 2.0, 3.0]\n[3, 8, 1, 10]",
      },
      { type: "para", text: "The x values are filled in automatically as 0, 1, 2, and 3. The points are (0, 3), (1, 8), (2, 1), and (3, 10), the same shape as before but starting at x = 0." },
      { type: "note", text: "The two lists must have the same length. If x has 4 values and y has 3, plot() raises an error instead of drawing anything." },
      { type: "tip", text: "Give x and y clear variable names like days and sales, not xpoints and ypoints, when the data means something real. It makes the code much easier to read later." },
    ],
    practice: [
      "Plot x = [1, 2, 3, 4, 5] against y = [2, 4, 6, 8, 10] and save the chart.",
      "Plot only the list [5, 3, 9, 2, 7] and print the automatic x values.",
      "Plot the same data twice: once with x values and once without, and compare the two charts.",
    ],
    summary: [
      "plt.plot(x, y) draws a line through pairs of values.",
      "With only one list, x defaults to 0, 1, 2, 3, and so on.",
      "The line connects the points in the order you give them.",
      "The x and y lists must have the same length.",
    ],
  },
  {
    slug: "matplotlib-markers",
    title: "Matplotlib Markers",
    intro: "A marker is the symbol drawn at each data point. By default a line chart shows only the line, but markers make the actual data points easy to see.",
    blocks: [
      { type: "heading", text: "What is a marker?" },
      { type: "para", text: "A marker is a small shape drawn at every data point: a circle, a square, a star, or many other shapes. Lines show the trend, markers show where the real measurements are. Pass marker=\"o\" to plot() to draw a circle at each point, so the chart becomes a rising line with four visible circles at the data points." },
      {
        type: "code",
        title: "Circle markers",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

line, = plt.plot([1, 2, 3, 4], [1, 4, 9, 16], marker="o")
print(line.get_marker())`,
        output: "o",
      },
      { type: "heading", text: "Change the marker size" },
      { type: "para", text: "The ms keyword sets the marker size in points. The default size is 6. This example uses size 12, so the circles are twice as large and stand out clearly." },
      {
        type: "code",
        title: "Bigger markers",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

line, = plt.plot([1, 2, 3, 4], [1, 4, 9, 16], marker="o", ms=12)
print(line.get_marker())
print(line.get_markersize())`,
        output: "o\n12.0",
      },
      { type: "heading", text: "Other marker shapes" },
      { type: "list", items: [
        "\"o\" draws a circle.",
        "\"s\" draws a square.",
        "\"*\" draws a star.",
        "\"^\" draws an upward triangle.",
        "\"D\" draws a diamond.",
        "\".\" draws a tiny point.",
      ] },
      { type: "tip", text: "You can also combine the marker, line style, and color in one short string. For example, \"o:r\" means circle markers, a dotted line, and the color red. This is called the format string. Use markers when the exact data points matter, for example in a science experiment, and use a plain line when only the overall trend matters." },
    ],
    practice: [
      "Plot [1, 2, 3, 4] against [2, 3, 5, 7] with square markers.",
      "Plot the same data with star markers of size 15.",
      "Try the format string \"s--b\" and work out what each character means.",
    ],
    summary: [
      "Markers are symbols drawn at each data point.",
      "marker=\"o\" draws circles; other letters draw other shapes.",
      "ms sets the marker size in points.",
      "A format string like \"o:r\" combines marker, line, and color.",
    ],
  },
  {
    slug: "matplotlib-line",
    title: "Matplotlib Line",
    intro: "The line connects your data points. You can change its style, its color, and its width to make the chart clearer or to tell two lines apart.",
    blocks: [
      { type: "heading", text: "Line styles" },
      { type: "para", text: "The linestyle keyword changes how the line looks. The common choices are solid, dotted, dashed, and dashdot. A dotted line is useful when you want a line to look lighter or less dominant than a solid one." },
      {
        type: "code",
        title: "Dotted line",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

line, = plt.plot([1, 2, 3, 4], [1, 4, 9, 16], linestyle="dotted")
print(line.get_linestyle())`,
        output: ":",
      },
      { type: "para", text: "Matplotlib stores the dotted style as the short code \":\". The other short codes are \"-\" for solid, \"--\" for dashed, and \"-.\" for dashdot. You can use either the full word or the short code." },
      { type: "heading", text: "Line color and width" },
      { type: "para", text: "The color keyword sets the line color, and linewidth sets its thickness in points. This example draws a thick red line, which stands out strongly against the white background." },
      {
        type: "code",
        title: "Red thick line",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

line, = plt.plot([1, 2, 3, 4], [1, 4, 9, 16], color="r", linewidth=3)
print(line.get_color())
print(line.get_linewidth())`,
        output: "r\n3.0",
      },
      { type: "heading", text: "Common colors" },
      { type: "list", items: [
        "\"r\" is red, \"g\" is green, \"b\" is blue.",
        "\"c\" is cyan, \"m\" is magenta, \"y\" is yellow.",
        "\"k\" is black, \"w\" is white.",
        "You can also use full color names like \"red\" or \"hotpink\".",
      ] },
      { type: "tip", text: "When you plot two lines on one chart, give them different colors and different line styles. Then a reader can tell them apart even in a black and white printout." },
    ],
    practice: [
      "Plot a dashed green line through [1, 2, 3, 4] and [1, 4, 9, 16].",
      "Plot two lines on one chart: a solid blue line and a dotted red line.",
      "Draw a line with linewidth 5 and describe how it looks compared to the default width.",
    ],
    summary: [
      "linestyle changes the line: solid, dotted, dashed, or dashdot.",
      "color sets the line color; single letters like \"r\" are shortcuts.",
      "linewidth sets the thickness in points.",
      "Different colors and styles help readers tell lines apart.",
    ],
  },
  {
    slug: "matplotlib-labels",
    title: "Matplotlib Labels",
    intro: "Labels explain what a chart shows. The title names the chart, and the axis labels explain what the numbers on each axis mean.",
    blocks: [
      { type: "heading", text: "Why labels matter" },
      { type: "para", text: "A chart without labels is a puzzle. The reader can see a line going up, but cannot tell what is being measured. A title and two axis labels turn the same chart into a clear message." },
      { type: "heading", text: "Add a title and axis labels" },
      { type: "para", text: "The title() function adds a heading, xlabel() labels the horizontal axis, and ylabel() labels the vertical axis. This example charts test scores against hours studied, so each label says exactly what its axis measures." },
      {
        type: "code",
        title: "Title and axis labels",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4], [1, 4, 9, 16])
plt.xlabel("Hours studied")
plt.ylabel("Test score")
plt.title("Study time and scores")
print(plt.gca().get_xlabel())
print(plt.gca().get_ylabel())
print(plt.gca().get_title())`,
        output: "Hours studied\nTest score\nStudy time and scores",
      },
      { type: "heading", text: "Style the title" },
      { type: "para", text: "The fontdict keyword lets you style the title text. You can set the font family, the size, and the color. This example uses a serif font at size 15." },
      {
        type: "code",
        title: "Styled title",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4], [1, 4, 9, 16])
plt.title("Study time and scores", fontdict={"family": "serif", "size": 15})
print(plt.gca().get_title())
print(plt.gca().title.get_fontsize())`,
        output: "Study time and scores\n15.0",
      },
      { type: "para", text: "You can style the axis labels the same way. Pass fontdict to xlabel() or ylabel() with the family, size, and color you want." },
      { type: "tip", text: "Keep labels short and plain. \"Hours studied\" is better than \"Number of hours spent studying for the test\". The reader should understand each label in one second." },
    ],
    practice: [
      "Plot monthly rainfall and label both axes and the title.",
      "Make the title size 20 and print the font size to confirm it.",
      "Change the x label color to red using fontdict and save the chart.",
    ],
    summary: [
      "plt.title() names the chart.",
      "plt.xlabel() and plt.ylabel() explain the axes.",
      "fontdict styles the text with family, size, and color.",
      "Good labels let a reader understand the chart in seconds.",
    ],
  },
  {
    slug: "matplotlib-grid",
    title: "Matplotlib Grid",
    intro: "Grid lines are faint lines that run across the chart behind the data. They help the reader read exact values off the axes.",
    blocks: [
      { type: "heading", text: "What is a grid?" },
      { type: "para", text: "A grid is a set of horizontal and vertical lines lined up with the tick marks on the axes. It turns the empty space of a chart into a sheet of graph paper, so the eye can follow a point across to its value on an axis. Call plt.grid() to draw grid lines on both axes, as in the example below, which plots four points and adds a grid." },
      {
        type: "code",
        title: "Grid on both axes",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4], [1, 4, 9, 16])
plt.grid()
plt.savefig("/tmp/mpl_grid.png")
print("Grid lines are on")`,
        output: "Grid lines are on",
      },
      { type: "heading", text: "Grid on one axis only" },
      { type: "para", text: "The axis keyword limits the grid to one direction. Use axis=\"x\" for vertical lines only, or axis=\"y\" for horizontal lines only. Horizontal lines are usually the most useful, because most charts are read by looking across to the y values." },
      { type: "heading", text: "Style the grid lines" },
      { type: "para", text: "Grid lines can be styled like any other line. This example makes them green, dashed, and thin, so they guide the eye without competing with the data line." },
      {
        type: "code",
        title: "Styled grid",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4], [1, 4, 9, 16])
plt.grid(color="green", linestyle="--", linewidth=0.5)
plt.savefig("/tmp/mpl_grid2.png")
print("Grid lines are green and dashed")`,
        output: "Grid lines are green and dashed",
      },
      { type: "tip", text: "The color, linestyle, and linewidth keywords work the same way here as they do for plot(). Keep grid lines light and thin: they are helpers, not the main content. Turn the grid off again with plt.grid(False), which is useful when you draw a chart that should look clean, like a pie chart or a presentation slide." },
    ],
    practice: [
      "Plot [1, 2, 3, 4] against [10, 20, 15, 25] and add a grid.",
      "Add a grid on the y-axis only and save the chart.",
      "Style the grid with a light grey color and a dotted line, then compare it with the default grid.",
    ],
    summary: [
      "plt.grid() draws grid lines lined up with the tick marks.",
      "axis=\"x\" or axis=\"y\" limits the grid to one direction.",
      "Grid lines take color, linestyle, and linewidth like other lines.",
      "Keep grid lines faint so the data stays the focus.",
    ],
  },
  {
    slug: "matplotlib-subplot",
    title: "Matplotlib Subplot",
    intro: "A subplot is one small chart inside a bigger figure. Subplots let you show several related charts side by side so the reader can compare them.",
    blocks: [
      { type: "heading", text: "What is a subplot?" },
      { type: "para", text: "A figure can hold more than one plot. Each plot sits in its own cell of a grid, like tiles on a wall. For example, a figure with 1 row and 2 columns holds two charts next to each other." },
      { type: "heading", text: "Two charts side by side" },
      { type: "para", text: "The subplot() function takes three numbers: rows, columns, and the position of the plot you are about to draw. This example draws a rising line on the left and a falling line on the right." },
      {
        type: "code",
        title: "Two subplots",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.subplot(1, 2, 1)
plt.plot([1, 2, 3], [1, 2, 3])
plt.subplot(1, 2, 2)
plt.plot([1, 2, 3], [3, 2, 1])
print(len(plt.gcf().get_axes()))`,
        output: "2",
      },
      { type: "para", text: "The call subplot(1, 2, 1) selects the first cell of a 1 by 2 grid, and subplot(1, 2, 2) selects the second. Each plot() call draws into whichever cell is currently selected." },
      { type: "heading", text: "The subplots() shortcut" },
      { type: "para", text: "The subplots() function creates the figure and all its axes in one call and returns them as a grid. This example makes a 2 by 2 grid, draws in the top left and bottom right cells, and gives each chart a title." },
      {
        type: "code",
        title: "Four subplots at once",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2)
axes[0, 0].plot([1, 2, 3], [1, 2, 3])
axes[0, 0].set_title("Top left")
axes[1, 1].plot([1, 2, 3], [3, 2, 1])
axes[1, 1].set_title("Bottom right")
print(len(fig.axes))
print(axes[0, 0].get_title())
print(axes[1, 1].get_title())`,
        output: "4\nTop left\nBottom right",
      },
      { type: "note", text: "With subplots() you address each cell by its row and column, like axes[0, 0] for the top left. This is clearer than subplot() when a figure has many cells. Give the figure a title for the whole page with fig.suptitle(), while each subplot keeps its own small title as well." },
    ],
    practice: [
      "Draw two subplots: a rising line on the left and a falling line on the right.",
      "Make a 2 by 2 grid with subplots() and draw a different line in each cell.",
      "Add a figure title with fig.suptitle() and save the chart.",
    ],
    summary: [
      "Subplots are small charts arranged in a grid inside one figure.",
      "plt.subplot(rows, columns, position) selects one cell to draw in.",
      "plt.subplots(rows, columns) creates the figure and all axes at once.",
      "Address each cell by row and column, like axes[0, 0].",
    ],
  },
  {
    slug: "matplotlib-scatter",
    title: "Matplotlib Scatter",
    intro: "A scatter plot draws one dot per data point, with no connecting line. It is the best chart for asking whether two things are related.",
    blocks: [
      { type: "heading", text: "What is a scatter plot?" },
      { type: "para", text: "A scatter plot takes two lists, x and y, and draws a dot at each pair of values. Because there is no line, the reader sees the raw pattern: dots that rise together, dots that fall, or dots with no pattern at all." },
      { type: "heading", text: "Draw a scatter plot" },
      { type: "para", text: "The scatter() function draws the dots. This example plots ten pairs of numbers. The dots spread across the chart with no clear upward or downward trend, which suggests the two numbers are not strongly related." },
      {
        type: "code",
        title: "Scatter plot",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

x = [5, 7, 8, 7, 2, 17, 2, 9, 4, 11]
y = [99, 86, 87, 88, 111, 86, 103, 87, 94, 78]
plt.scatter(x, y)
plt.savefig("/tmp/mpl_scatter.png")
print(len(x))
print("points plotted")`,
        output: "10\npoints plotted",
      },
      { type: "heading", text: "Sizes and colors" },
      { type: "para", text: "Every dot can have its own size and color. The s keyword takes a list of sizes, and the c keyword takes a list of colors. This lets one chart show three things at once: the x value, the y value, and a third value shown by size or color." },
      {
        type: "code",
        title: "Sizes and colors",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

x = [5, 7, 8, 7, 2]
y = [99, 86, 87, 88, 111]
sizes = [100, 200, 300, 400, 500]
colors = ["red", "green", "blue", "orange", "purple"]
plt.scatter(x, y, s=sizes, c=colors)
plt.savefig("/tmp/mpl_scatter2.png")
print(sizes)
print(colors)`,
        output: "[100, 200, 300, 400, 500]\n['red', 'green', 'blue', 'orange', 'purple']",
      },
      { type: "para", text: "The dots grow from size 100 to size 500 across the chart, and each dot has a different color. The size and color lists must match the length of the x and y lists." },
      { type: "tip", text: "Use the alpha keyword to make dots see-through, for example alpha=0.5. Overlapping dots then look darker, which shows where many points pile up." },
    ],
    practice: [
      "Scatter-plot study hours against test scores for five students.",
      "Give each dot a size from a third list, for example the number of books each student read.",
      "Color the dots by group, for example red for one class and blue for another.",
    ],
    summary: [
      "plt.scatter(x, y) draws one dot per pair of values.",
      "Scatter plots show whether two variables move together.",
      "s sets the dot sizes and c sets the dot colors.",
      "Sizes and colors can show a third value on the same chart.",
    ],
  },
  {
    slug: "matplotlib-bars",
    title: "Matplotlib Bars",
    intro: "A bar chart draws one rectangle per category. The length of each bar shows its value, which makes comparisons between categories easy at a glance.",
    blocks: [
      { type: "heading", text: "What is a bar chart?" },
      { type: "para", text: "A bar chart compares values across categories. Each category gets a bar, and taller bars mean larger values. Bar charts work best when the categories have names, like products, months, or teams." },
      { type: "heading", text: "Draw vertical bars" },
      { type: "para", text: "The bar() function takes a list of category names and a list of values. This example charts four categories, A to D. Category B is the tallest at 8, and category C is the shortest at 1." },
      {
        type: "code",
        title: "Vertical bar chart",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

x = ["A", "B", "C", "D"]
y = [3, 8, 1, 10]
bars = plt.bar(x, y)
plt.savefig("/tmp/mpl_bar.png")
print(len(bars))
print("bars drawn")`,
        output: "4\nbars drawn",
      },
      { type: "heading", text: "Draw horizontal bars" },
      { type: "para", text: "The barh() function draws the bars sideways. Horizontal bars are better when the category names are long, because there is more room to read them. This example draws the same four values as green horizontal bars." },
      {
        type: "code",
        title: "Horizontal bar chart",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

x = ["A", "B", "C", "D"]
y = [3, 8, 1, 10]
bars = plt.barh(x, y, color="green")
plt.savefig("/tmp/mpl_barh.png")
print(len(bars))
print(bars[0].get_width())`,
        output: "4\n3",
      },
      { type: "para", text: "The first bar belongs to category A and has a width of 3, which matches the first value in the list. Each bar object stores its own size, so you can read values back from the chart." },
      { type: "tip", text: "Use the width keyword to make vertical bars thinner or thicker. A width of 0.5 leaves clear gaps between bars, which usually looks cleaner than bars that touch." },
    ],
    practice: [
      "Draw a bar chart of the marks of four students in a test.",
      "Draw the same chart horizontally with barh() and color the bars orange.",
      "Add a title and label the y-axis \"Marks\" on your chart.",
    ],
    summary: [
      "plt.bar(x, y) draws vertical bars, one per category.",
      "plt.barh(x, y) draws horizontal bars.",
      "The height or length of each bar shows its value.",
      "Horizontal bars suit long category names.",
    ],
  },
  {
    slug: "matplotlib-histograms",
    title: "Matplotlib Histograms",
    intro: "A histogram shows how numbers are spread out. It groups values into bins and draws one bar per bin, so you can see where most values fall.",
    blocks: [
      { type: "heading", text: "What is a histogram?" },
      { type: "para", text: "A histogram answers a simple question: how are my numbers distributed? It splits the range of values into equal groups called bins, counts how many values fall in each bin, and draws a bar for each count. Tall bars show where values pile up." },
      { type: "heading", text: "Draw a histogram" },
      { type: "para", text: "The hist() function takes a list of numbers and a number of bins. This example uses the ages of twelve people, split into five bins. The counts show most people are in the younger bins." },
      {
        type: "code",
        title: "Histogram of ages",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ages = [22, 25, 25, 27, 30, 31, 31, 33, 35, 40, 42, 45]
n, bins, patches = plt.hist(ages, bins=5)
print([int(v) for v in n])`,
        output: "[3, 4, 2, 1, 2]",
      },
      { type: "para", text: "The hist() function returns three things: n, the counts in each bin; bins, the edges of the bins; and patches, the bar objects. The counts add up to 12, the number of ages in the list." },
      { type: "heading", text: "Change the number of bins" },
      { type: "para", text: "More bins give a finer picture, fewer bins give a rougher one. With ten bins the same twelve ages spread out into ten thin bars, which shows the gaps between values more clearly." },
      {
        type: "code",
        title: "Ten bins",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ages = [22, 25, 25, 27, 30, 31, 31, 33, 35, 40, 42, 45]
n, bins, patches = plt.hist(ages, bins=10)
print(len(n))
print("bins in the histogram")`,
        output: "10\nbins in the histogram",
      },
      { type: "note", text: "A histogram is not a bar chart. In a bar chart each bar is a category. In a histogram each bar is a range of numbers, and the bars touch each other because the ranges are next to each other." },
    ],
    practice: [
      "Make a histogram of twenty test scores with 5 bins.",
      "Redraw it with 10 bins and describe how the picture changes.",
      "Print the bin counts and check that they add up to the number of values.",
    ],
    summary: [
      "plt.hist(values, bins=n) groups numbers into bins and counts them.",
      "Each bar shows how many values fall in one range.",
      "More bins give a finer picture; fewer bins give a rougher one.",
      "hist() returns the counts, the bin edges, and the bar objects.",
    ],
  },
  {
    slug: "matplotlib-pie-charts",
    title: "Matplotlib Pie Charts",
    intro: "A pie chart shows parts of a whole as slices of a circle. Each slice is sized by its share of the total, which makes proportions easy to see.",
    blocks: [
      { type: "heading", text: "What is a pie chart?" },
      { type: "para", text: "A pie chart turns numbers into slices of a circle. A value that is half the total gets half the circle. Pie charts work well when you want to show shares, like the share of each fruit sold in a shop." },
      { type: "heading", text: "Draw a pie chart" },
      { type: "para", text: "The pie() function takes a list of values. This example splits a total of 100 into four slices of 35, 25, 25, and 15. The biggest slice takes just over a third of the circle." },
      {
        type: "code",
        title: "Simple pie chart",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

sizes = [35, 25, 25, 15]
plt.pie(sizes)
plt.savefig("/tmp/mpl_pie.png")
print(sum(sizes))`,
        output: "100",
      },
      { type: "heading", text: "Add labels and pull out a slice" },
      { type: "para", text: "The labels keyword names each slice, and the explode keyword pulls one slice slightly away from the rest to draw attention to it. This example labels the four fruits and pulls the Apples slice out by 0.1." },
      {
        type: "code",
        title: "Labels and explode",
        code: `import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

labels = ["Apples", "Bananas", "Cherries", "Dates"]
sizes = [35, 25, 25, 15]
explode = [0.1, 0, 0, 0]
plt.pie(sizes, labels=labels, explode=explode)
plt.savefig("/tmp/mpl_pie2.png")
print(labels)
print(sum(sizes))`,
        output: "['Apples', 'Bananas', 'Cherries', 'Dates']\n100",
      },
      { type: "para", text: "The explode list has one number per slice. A value of 0.1 moves the slice out by a tenth of the radius, while 0 keeps the other slices in place." },
      { type: "tip", text: "Pie charts work best with a few slices, ideally five or fewer. With many slices the small ones become hard to read, and a bar chart is usually clearer." },
    ],
    practice: [
      "Draw a pie chart of how you spend a week: study, sleep, play, and other.",
      "Add labels to each slice and explode the biggest slice.",
      "Try seven slices and decide for yourself whether the chart is still easy to read.",
    ],
    summary: [
      "plt.pie(values) draws slices sized by their share of the total.",
      "labels names each slice.",
      "explode pulls a slice away from the circle to highlight it.",
      "Pie charts suit a few slices; use a bar chart for many categories.",
    ],
  },
];