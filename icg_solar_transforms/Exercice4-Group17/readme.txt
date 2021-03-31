--- ICG: README Exercice 4 - Group 24 ---

-- 4.1.1
- 4.1.1.1
We edited the main function of the vertex shader code by adding the mouse offset to the current position. After that, we put this in a vec4 (with last coordinate being 1 as the vector represents a point) to fulfill the homogenous coordinates conditions.
- 4.1.1.2
For this part, we just replaced the [0.,0.,0.] 'no offset' input to the function by the mouse_offset uniform by the computed mouse_offset variable.

-- 4.1.2
- 4.1.2.1
Similarly to the previous part, we edited the main function of the vertex shader. To apply the transformation, we just multiply the homogenized position by the transformation matrix representation.
- 4.1.2.2
For this part, we created our representative translation vector, and used the built-in 'fromTranslation' method. We also used the 'fromZRotation' method to create a similar rotation matrix.
Recalling that transformations are applied from right to left, we build our orbiting triangle by applying rotation then translation (change of moving direction and go forward). Similarly for the spinning triangle we first translate then rotate it (move forward then rotate around itself).

-- 4.2.1
- 4.2.1.1
Similarly to 4.1.2.1, we just multiplied the homogenized position to the left by the transformation matrix to apply the linear transformation.
- 4.2.1.2
We here had to create the combination of linear applications, we did so by multiplying the transformation matrices. However, we had to take care of the multiplication order (which we found again specified on https://jsantell.com/model-view-projection/). Also, the handout specified to use 'actor.mat_model_to_world' and 'mat_world_to_cam' which were undefined. By observing the above code, we found out that 'this.mat_model_to_world' and 'mat_view' were expected.

-- 4.2.2
As specified by the handout, we tackled this part by creating first a 'look_at' matrix (as in https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/lookat-function) looking at the origin, at distance 'cam_distance_base * cam_distance_factor' from the origin and oriented along +z axis.
We then easily applied, as in 4.1.2, the rotation matrices with the specified angles to rotate the camera and place it as specified.

-- 4.2.3
We created all the necessary matrices as specified and then multiplied them all and stored them in mat_model_to_world. Here, we at first did not know how to make the moon turn around the earth and not the sun, until we realized that we had to apply a first multiplication with respect to the orbit parent, and then multiply that with the scale and rotation matrices.

- WORKLOAD
Tom 33 %
Louise 33 %
Emmanuelle 33 %