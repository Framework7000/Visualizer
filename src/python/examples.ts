// Ready-to-run programs for the "Real Python" mode. These use genuine
// libraries (numpy, pandas, scikit-learn, matplotlib) that Pyodide provides.

export interface PyExample {
  id: string
  title: string
  emoji: string
  tag: string
  code: string
}

export const PY_EXAMPLES: PyExample[] = [
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    emoji: '📊',
    tag: 'watch it sort',
    code: `# Watch the bars sort themselves, step by step!
def selection_sort(numbers):
    n = len(numbers)
    for i in range(n):
        min_index = i
        for j in range(i + 1, n):
            if numbers[j] < numbers[min_index]:
                min_index = j
        if min_index != i:
            numbers[i], numbers[min_index] = numbers[min_index], numbers[i]
    return numbers

nums = [29, 72, 98, 13, 87, 66, 52, 51, 36]
selection_sort(nums)
print("Sorted:", nums)`,
  },
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    emoji: '🫧',
    tag: 'watch it sort',
    code: `# Bubble sort: swap neighbours until it's in order
nums = [5, 2, 9, 1, 7, 3]
n = len(nums)
for i in range(n):
    for j in range(n - 1 - i):
        if nums[j] > nums[j + 1]:
            nums[j], nums[j + 1] = nums[j + 1], nums[j]
print("Sorted:", nums)`,
  },
  {
    id: 'fib-tree',
    title: 'Fibonacci (tree)',
    emoji: '🌳',
    tag: 'recursion tree',
    code: `# Watch the recursion tree grow and collapse!
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print("fib(6) =", fib(6))`,
  },
  {
    id: 'two-sum',
    title: 'Two Sum (hash map)',
    emoji: '🗂️',
    tag: 'dictionary',
    code: `# Find two numbers that add up to the target — using a hash map
def two_sum(nums, target):
    seen = {}
    for i in range(len(nums)):
        need = target - nums[i]
        if need in seen:
            return [seen[need], i]
        seen[nums[i]] = i
    return []

nums = [3, 8, 12, 1, 9, 14, 6, 5]
print("indices:", two_sum(nums, 18))`,
  },
  {
    id: 'basics',
    title: 'Python Basics',
    emoji: '🐍',
    tag: 'No libraries',
    code: `# Plain Python — a quick warm-up
def greet(name):
    return f"Hello, {name}!"

names = ["Aria", "Ben", "Chloe"]
for n in names:
    print(greet(n))

total = 0
for x in range(1, 6):
    total = total + x
print("Sum 1..5 =", total)`,
  },
  {
    id: 'pandas',
    title: 'Data with pandas',
    emoji: '🐼',
    tag: 'pandas · numpy',
    code: `import numpy as np
import pandas as pd

# Make a small table of students and scores
df = pd.DataFrame({
    "name": ["Aria", "Ben", "Chloe", "Dev", "Esha"],
    "math": [88, 72, 95, 60, 81],
    "science": [91, 68, 89, 75, 84],
})
df["average"] = df[["math", "science"]].mean(axis=1)

print(df)
print()
print("Class average:", round(df["average"].mean(), 1))
print("Top student:", df.loc[df["average"].idxmax(), "name"])`,
  },
  {
    id: 'plot',
    title: 'Draw a Chart',
    emoji: '📈',
    tag: 'matplotlib',
    code: `import numpy as np
import matplotlib.pyplot as plt

plt.style.use('dark_background')
x = np.linspace(0, 2 * np.pi, 200)

fig, ax = plt.subplots(figsize=(5.2, 3))
ax.plot(x, np.sin(x), label="sin(x)", color="#38BDF8", linewidth=2.5)
ax.plot(x, np.cos(x), label="cos(x)", color="#EC4899", linewidth=2.5)
ax.set_title("Waves", color="#FFFFFF", fontsize=11, fontweight="bold")
ax.legend(facecolor="#111524", edgecolor="#8E5BFF")
ax.grid(True, alpha=0.2, color="#8E5BFF")
plt.tight_layout()
plt.show()

print("Chart ready! 📊")`,
  },
  {
    id: 'wine-ml',
    title: 'Wine Classifier (ML)',
    emoji: '🍷',
    tag: 'scikit-learn',
    code: `# Machine learning: classify wines with a Decision Tree
import pandas as pd
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report

# Collect the data
wine = load_wine()

# Convert to a pandas DataFrame
df = pd.DataFrame(data=wine.data, columns=wine.feature_names)
df["target"] = wine.target

# Peek at the data
print(df.head())

# Features / target, standardize, split
X = df.drop("target", axis=1)
y = df["target"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

# Create and train the model
model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)

# Predict and evaluate
y_pred = model.predict(X_test)
print("\nAccuracy:", round(accuracy_score(y_test, y_pred), 3))
print(classification_report(y_test, y_pred))`,
  },
  {
    id: 'wine-plot',
    title: 'ML + Feature Chart',
    emoji: '🌳',
    tag: 'scikit-learn · matplotlib',
    code: `# Which features matter most for classifying wine?
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

plt.style.use('dark_background')
wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(
    wine.data, wine.target, test_size=0.2, random_state=42
)

model = RandomForestClassifier(n_estimators=120, random_state=42)
model.fit(X_train, y_train)
print("Accuracy:", round(model.score(X_test, y_test), 3))

# Plot the most important features
importances = model.feature_importances_
order = np.argsort(importances)[-6:]
fig, ax = plt.subplots(figsize=(5.2, 3))
ax.barh([wine.feature_names[i] for i in order], importances[order], color="#8E5BFF")
ax.set_title("Top features for telling wines apart", color="#FFFFFF", fontsize=11, fontweight="bold")
ax.grid(True, alpha=0.15)
plt.tight_layout()
plt.show()`,
  },
]

export const DEFAULT_PY_EXAMPLE = PY_EXAMPLES[0] // Selection Sort
