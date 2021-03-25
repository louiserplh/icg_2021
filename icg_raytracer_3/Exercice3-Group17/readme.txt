-- read me exercise 3 - ICG --

Task 3.1.1: Compute triangle normals and opening angles

At first, we coded this part without any real issues and then moved on to other tasks. However, we realized when working on Phong shading that we had several errors : first of all, some of the calculated angles were incorrect, and we had some syntax issues. When we fixed those issues, everything worked as expected.

Task 3.1.2: Compute vertex normals

Similarly, we didn't run into issues with this part until we tested Phong shading. Again, the errors were mainly syntax ones (like assigning out vectors that made the program behave strangely), which we fixed to have the function work correctly.

Task 3.2.1: Implement ray-triangle intersection

For this section, we wrote some helper methods like cramer_solve. We ran into some issues in trying to understand how entities like vec3 were represented and how we could access its elements, but we quickly figured it out and implemented an algorithm that seems correct.

Task 3.2.2: Implement flat and Phong shading strategies

Whilst the flat shading part did not give us many issues, Phong shading did not work at all. Since the OpenGL code is quite short and straightforward, we couldn't understand why, until we realized that the issue lay with the previously written javascript code. Once we fixed that, we received the expected output for both flat and phong shading.

Task 3.3: Implement Bounding Box intersection

To better understand what was expected of us here, we did some online research about the algorithm and tried some of our own examples. For quite a while, we could only visualize about a quarter of the output. We realized that this was because ray_direction was often too small and the output was therefore corrupted. After fixing that, our code worked as expected, rendering much faster and with the correct bounding box.

- WORKLOAD
Tom 33 %
Louise 33 %
Emmanuelle 33 %