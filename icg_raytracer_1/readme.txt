-- read me exercise 1 - ICG --

- TASK 1.1: IMPLEMENT RAY-PLANE INTERSECTIONS
for this task, we asked TAs about what exactly we had to return, 
and what was represented by each argument.
we found out that if we did the dot product with the normal of the plane and
if the normal was going towards us, then the dot product was negative 
=> we changed the sign.
We found it with the formula from the course and then we checked our calculations 
by hand to see if our values were correct because we didn't know for sure.

- TASK 1.2.1:  DERIVE EXPRESSION FOR A RAY-CYLINDER INTERSECTIONS
we used overleaf to write TheoryExercise_1.
We did a zoom meeting to talk about the equation of the cylinder and brainstorm
our ideas because it was a bit complicated at first to see how to represent it
in a good way. After some drawings, many miscalculations and some reflexion on our own,
Tom found the final solution ( because we had problems developing the second degree equation)
and wrote the explanation.  

- TASK 1.2.2: IMPLEMENT RAY-CYLINDER INTERSECTIONS
with our first version of the solution, the result was showing us only the back of
the cylinder but not the front. 
we implemented separate functions, one for the infinite cylinder and one to cut between the two caps.
We solved the equations found in task 1.2.1 and we made sure that we took the closest solution
to have the asking result.

- WORKLOAD
Tom 40%
Emmanuelle 35%
Louise 25%
