import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import {GET_MY_TODOS} from './TodoPrivateList';

// Las queries de GQL soportan variables las cuales son pasadas como
// parámetros en el hook.
const ADD_TODO = gql`
  mutation ($todo: String!, $isPublic: Boolean!) {
    insert_todos(objects: {title: $todo, is_public: $isPublic}) {
      affected_rows
      returning {
        id
        title
        created_at
        is_completed
      }
    }
  }
 `;

const TodoInput = ({ isPublic = false }) => {
  const [todoInput, setTodoInput] = useState('');

  const updateCache = (cache, {data}) => {
    // If this is for the public feed, do nothing
    if (isPublic) {
      return null;
    }
    // Fetch the todos from the cache
    const existingTodos = cache.readQuery({
      query: GET_MY_TODOS
    });
    // Add the new todo to the cache
    const newTodo = data.insert_todos.returning[0];
    cache.writeQuery({
      query: GET_MY_TODOS,
      data: {todos: [newTodo, ...existingTodos.todos]}
    });
  };

    const resetInput = () => {
    setTodoInput('');
  };

  const [addTodo] = useMutation(ADD_TODO, {
	  // Al hook useMutation se le pueden añadir callbacks para
	  // determinados eventos (ej. update)
    update: updateCache,
    onCompleted: resetInput
  });
  return (
    <form
      className="formInput"
      onSubmit={e => {
        e.preventDefault();
        addTodo({ variables: { todo: todoInput, isPublic } });
      }}
    >
      <input
        className="input"
        placeholder="What needs to be done?"
        value={todoInput}
        onChange={e => (setTodoInput(e.target.value))}
      />
      <i className="inputMarker fa fa-angle-right" />
    </form>
  );
};

export default TodoInput;
