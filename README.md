# Team Balancing Program
This program uses a heuristic algorithm to produce an approximation to what is basically a partition optimization problem.

## The Problem
The problem that needs solving in this case is how to sort a number of players into teams of similar skill level. We can get a baseline estimate for how strong teams should be by finding the average value of all players in the pool. Creating teams of equal skill will not be exact, regardless of the method used. Ideally the teams will have an average player value that is close to the average of the group as a whole.

## Solution: The Greedy Algorithm
To solve this problem, the program is written to follow the Greedy Algorithm. The greedy algorithm iterates through the numbers in descending order, assigning each of them to whichever subset has the smaller sum.

*Example:*
`Players: (7,7,7,5,5,5,4,3,1,1) Average: 4.5
Team 1: (7,7,5,3,1) Sum: 23 Average: 4.6
Team 2: (7,5,5,4,1) Sum: 22 Average: 4.4`

### Optimization for More than 2 Teams
When splitting a group into two teams, this solution does well. However, when the number of requested teams exceeds 2 there is a chance that the teams created will not be fully optimized. When this is the case, we'll need to check teams manually and possibly swap a few values to better optimize the outcome.

*Example:*
**Solution from the Greedy Algorithm**
`Players: (11,10,8,8,7,7,7,7,7,6,5,5,5,4,4,3,3,2,1,1) Average: 5.55
Team 1: (11,7,5,3,3) Sum: 29 Average: 5.8
Team 2: (10,7,5,4,2) Sum: 28 Average: 5.6
Team 3: (8,7,7,4,1) Sum: 27 Average: 5.4
Team 4: (8,7,6,5,1) Sum: 27 Average: 5.4`

**Optimized Solution**
`Players: (11,10,8,8,7,7,7,7,7,6,5,5,5,4,4,3,3,2,1,1) Average: 5.55
Team 1: (11,7,4,3,3) Sum: 28 Average: 5.6
Team 2: (10,7,5,4,2) Sum: 28 Average: 5.6
Team 3: (8,7,7,5,1) Sum: 28 Average: 5.6
Team 4: (8,7,6,5,1) Sum: 27 Average: 5.4`

To manually optimize teams, look at the team averages compared to the overall average. Ideally you want the team averages to be no more than .2 away from the overall average. Closer is better.
