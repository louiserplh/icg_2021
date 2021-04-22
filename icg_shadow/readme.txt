---- ICG: README Exercice 6 Group 17 ----
---6.1---

For the first part, we had to take a look at the geometry of the light cube to understand the parameters to give to the perspective function and the lookAt function. 
We had a few issues including the fact that we forgot to translate the light position to the correct coordinate system, 
but once we fixed that, everything worked as expected.

---6.2---

--6.2.1--
the euclidean distance is just the length of the vector v2f_position_view.

--6.2.2--
We first needed to adapt the implementations of the varying outputs (v2f_postion_view, v2f_normal and gl_Position).
Since the instructions were pretty explicit , we didn't have any problems.
For the phong shading, we copied our phong shading for exercise 5.
First we deleted the ambient light which is implemented in another part of the code,then we calculated the shadow map and set the condition as said in the TODO for avoiding shadow acne.
We had a problem with this part because even if the phong shader seemed ok, the final result was way to dark ( as if there was no light).
The problem was a wrong line of code where in the if condition, we redefined the variable for the final color, implying that the color in gl_FragColor was always 0.

--6.2.3--
as seen in the doc given, the formula for the blending color is color(RGBA) = (sourceColor * sfactor) + (destinationColor * dfactor).
Since we need each iteration of our loop over the lights to add to the current image, we set src and dst to one. 

WORKLOAD

Tom 1/3
Louise 1/3
Emmanuelle 1/3